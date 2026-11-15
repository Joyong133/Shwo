package kr.shwo.sitegrabber;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.safety.Safelist;

import java.io.File;
import java.io.FileOutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** 같은 사이트 안의 링크를 너비 우선으로 따라가며 페이지·본문·파일을 모은다. */
public class Crawler {
    public static final String UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 SiteGrabber/1.0";
    private static final Pattern FILE_EXT = Pattern.compile(
            "(?i).*\\.(jpe?g|png|gif|webp|svg|bmp|ico|avif|pdf|zip|hwpx?|docx?|xlsx?|pptx?|txt|csv|mp3|mp4|webm|mov)$");
    private static final long MAX_FILE = 30L * 1024 * 1024;

    public static class Page {
        public String url, title, text, htmlFile, error;
        @Override public String toString() { return error != null ? "실패: " + url : (title.isEmpty() ? url : title); }
    }

    public interface Listener {
        void onPage(Page p, int done, int max, int queued);
        void onLog(String msg);
        void onFinish(String summary);
    }

    /** JS 모드: 페이지를 WebView로 그려 HTML을 돌려준다 (null = 실패). */
    public interface Renderer { String render(String url) throws Exception; }

    public final List<Page> pages = new ArrayList<>();
    public final List<String[]> files = new ArrayList<>(); // {url, 저장경로}
    public final File workDir;
    private volatile boolean stop;
    private final Set<String> seenPages = new HashSet<>(), seenFiles = new HashSet<>();
    private final List<String> disallow = new ArrayList<>();

    private final String start, host, scope;
    private final int max;
    private final boolean grabFiles;
    private final Renderer renderer;
    private final Listener l;

    public Crawler(String startUrl, int max, boolean wholeSite, boolean grabFiles, Renderer renderer, File workDir, Listener l) throws Exception {
        this.start = normalize(startUrl);
        URI u = new URI(this.start);
        this.host = stripWww(u.getHost());
        String path = u.getRawPath() == null || u.getRawPath().isEmpty() ? "/" : u.getRawPath();
        this.scope = wholeSite ? "/" : path.substring(0, path.lastIndexOf('/') + 1);
        this.max = max;
        this.grabFiles = grabFiles;
        this.renderer = renderer;
        this.workDir = workDir;
        this.l = l;
    }

    public void stop() { stop = true; }

    public void run() {
        deleteRec(workDir);
        new File(workDir, "pages").mkdirs();
        new File(workDir, "files").mkdirs();
        loadRobots();
        ArrayDeque<String> queue = new ArrayDeque<>();
        queue.add(start);
        seenPages.add(start);
        int done = 0, errors = 0;
        l.onLog("시작: " + start + "  (범위 " + host + scope + ")");
        while (!queue.isEmpty() && done < max && !stop) {
            String url = queue.poll();
            if (!robotsAllowed(url)) { l.onLog("robots.txt 금지: " + url); continue; }
            Page p = new Page();
            p.url = url;
            try {
                Document doc;
                if (renderer != null) {
                    String html = renderer.render(url);
                    if (html == null) throw new Exception("페이지를 그리지 못했습니다");
                    doc = Jsoup.parse(html, url);
                } else {
                    Connection.Response res = Jsoup.connect(url).userAgent(UA).timeout(30000)
                            .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                            .ignoreContentType(true).ignoreHttpErrors(false).maxBodySize(0).followRedirects(true).execute();
                    String ct = res.contentType() == null ? "" : res.contentType().toLowerCase(Locale.ROOT);
                    byte[] body = res.bodyAsBytes();
                    String head = new String(body, 0, Math.min(body.length, 512), StandardCharsets.ISO_8859_1).trim().toLowerCase(Locale.ROOT);
                    if (!ct.contains("html") && !head.startsWith("<!doctype html") && !head.startsWith("<html")) {
                        saveFileBytes(res.url().toString(), body);
                        continue;
                    }
                    p.url = normalize(res.url().toString());
                    seenPages.add(p.url);
                    doc = Jsoup.parse(new java.io.ByteArrayInputStream(body), res.charset(), p.url);
                }
                p.title = doc.title().trim();
                File hf = new File(workDir, "pages/" + (pages.size() + 1) + ".html");
                write(hf, doc.outerHtml().getBytes(StandardCharsets.UTF_8));
                p.htmlFile = hf.getAbsolutePath();

                List<String> links = new ArrayList<>();
                for (Element a : doc.select("a[href], area[href], iframe[src]")) links.add(a.hasAttr("href") ? a.absUrl("href") : a.absUrl("src"));
                List<String> media = new ArrayList<>();
                for (Element m : doc.select("img, source, video, audio")) {
                    for (String k : new String[]{"src", "data-src", "data-original", "data-lazy-src"})
                        if (!m.attr(k).isEmpty()) media.add(m.absUrl(k));
                    String srcset = m.attr("srcset");
                    if (!srcset.isEmpty()) for (String s : srcset.split(",")) {
                        String one = s.trim().split("\\s+")[0];
                        if (!one.isEmpty()) try { media.add(new URI(p.url).resolve(one).toString()); } catch (Exception ignored) { }
                    }
                }

                p.text = extractText(doc);
                pages.add(p);
                done++;
                l.onPage(p, done, max, queue.size());

                for (String link : links) {
                    if (link.isEmpty()) continue;
                    String n;
                    try { n = normalize(link); } catch (Exception e) { continue; }
                    if (FILE_EXT.matcher(pathOf(n)).matches()) { if (grabFiles && inScope(n)) grabFile(n); continue; }
                    if (inScope(n) && seenPages.add(n)) queue.add(n);
                }
                if (grabFiles) for (String m : media) if (!stop) grabFile(m);
            } catch (Exception e) {
                errors++;
                p.title = "";
                p.text = "";
                p.error = e.getClass().getSimpleName() + ": " + e.getMessage();
                pages.add(p);
                done++;
                l.onPage(p, done, max, queue.size());
            }
            sleep(renderer != null ? 300 : 700);
        }
        String sum = (stop ? "멈춤 — " : "완료 — ") + "페이지 " + (pages.size() - errors) + "개, 파일 " + files.size() + "개, 실패 " + errors + "개";
        if (!queue.isEmpty() && !stop) sum += " (남은 링크 " + queue.size() + "개: 최대 페이지 수를 늘리세요)";
        l.onFinish(sum);
    }

    // ---------- 본문 텍스트 ----------
    static String extractText(Document src) {
        Document doc = src.clone();
        doc.select("script, style, noscript, template, svg, head").remove();
        doc.select("br").after("\\n");
        doc.select("p, div, li, tr, h1, h2, h3, h4, h5, h6, article, section, header, footer, blockquote, pre, table, ul, ol, dd, dt").before("\\n").after("\\n");
        String body = doc.body() == null ? doc.html() : doc.body().html();
        Document.OutputSettings os = new Document.OutputSettings().prettyPrint(false);
        String raw = Parser.unescapeEntities(Jsoup.clean(body, "", Safelist.none(), os), false).replace("\\n", "\n");
        StringBuilder sb = new StringBuilder();
        boolean blank = false;
        for (String line : raw.split("\n")) {
            String t = line.replaceAll("[ \\t\\u00a0]+", " ").trim();
            if (!t.isEmpty()) { sb.append(t).append('\n'); blank = false; }
            else if (!blank && sb.length() > 0) { sb.append('\n'); blank = true; }
        }
        return sb.toString().trim();
    }

    // ---------- 파일 ----------
    private void grabFile(String url) {
        try { url = normalize(url); } catch (Exception e) { return; }
        if (!url.startsWith("http") || !seenFiles.add(url)) return;
        try {
            Connection.Response res = Jsoup.connect(url).userAgent(UA).timeout(30000).ignoreContentType(true)
                    .maxBodySize((int) MAX_FILE).execute();
            saveFileBytes(res.url().toString(), res.bodyAsBytes());
        } catch (Exception e) {
            l.onLog("파일 실패: " + url);
        }
    }

    private void saveFileBytes(String url, byte[] body) throws Exception {
        URI u = new URI(url);
        String path = u.getRawPath() == null ? "" : u.getRawPath();
        String name = path.substring(path.lastIndexOf('/') + 1);
        if (name.isEmpty()) name = "file";
        name = java.net.URLDecoder.decode(name, "UTF-8").replaceAll("[\\\\/:*?\"<>|\\x00-\\x1f]", "_");
        if (name.length() > 80) name = name.substring(name.length() - 80);
        String rel = "files/" + safe(u.getHost()) + "/" + (files.size() + 1) + "_" + name;
        File f = new File(workDir, rel);
        f.getParentFile().mkdirs();
        write(f, body);
        files.add(new String[]{url, rel});
    }

    // ---------- robots.txt (User-agent: * 의 Disallow 만) ----------
    private void loadRobots() {
        try {
            URI u = new URI(start);
            String port = u.getPort() == -1 ? "" : ":" + u.getPort();
            String txt = Jsoup.connect(u.getScheme() + "://" + u.getHost() + port + "/robots.txt").userAgent(UA)
                    .timeout(10000).ignoreContentType(true).execute().body();
            boolean mine = false;
            for (String line : txt.split("\n")) {
                String s = line.replaceAll("#.*", "").trim();
                if (s.toLowerCase(Locale.ROOT).startsWith("user-agent:")) mine = s.substring(11).trim().equals("*");
                else if (mine && s.toLowerCase(Locale.ROOT).startsWith("disallow:")) {
                    String d = s.substring(9).trim();
                    if (!d.isEmpty()) disallow.add(d);
                }
            }
        } catch (Exception ignored) { }
    }

    private boolean robotsAllowed(String url) {
        String p = pathOf(url);
        try { String q = new URI(url).getRawQuery(); if (q != null) p += "?" + q; } catch (Exception ignored) { }
        for (String d : disallow) {
            String pat = d.endsWith("$") ? d.substring(0, d.length() - 1) : d;
            if (pat.contains("*")) {
                String re = Pattern.quote(pat).replace("*", "\\E.*\\Q") + (d.endsWith("$") ? "$" : ".*");
                if (p.matches(re)) return false;
            } else if (p.startsWith(pat)) return false;
        }
        return true;
    }

    // ---------- 주소 도우미 ----------
    private boolean inScope(String url) {
        try {
            URI u = new URI(url);
            String s = u.getScheme();
            return ("http".equals(s) || "https".equals(s)) && host.equals(stripWww(u.getHost())) && pathOf(url).startsWith(scope);
        } catch (Exception e) { return false; }
    }

    static String normalize(String url) throws Exception {
        int h = url.indexOf('#');
        if (h >= 0) url = url.substring(0, h);
        URI u = new URI(url.trim().replace(" ", "%20"));
        String path = u.getRawPath() == null || u.getRawPath().isEmpty() ? "/" : u.getRawPath();
        String q = u.getRawQuery() == null ? "" : "?" + u.getRawQuery();
        String port = u.getPort() == -1 ? "" : ":" + u.getPort();
        return u.getScheme().toLowerCase(Locale.ROOT) + "://" + u.getHost().toLowerCase(Locale.ROOT) + port + path + q;
    }

    private static String pathOf(String url) {
        try { String p = new URI(url).getRawPath(); return p == null || p.isEmpty() ? "/" : p; } catch (Exception e) { return "/"; }
    }

    private static String stripWww(String h) { return h == null ? "" : h.toLowerCase(Locale.ROOT).replaceFirst("^www\\.", ""); }
    static String safe(String s) { return s == null ? "site" : s.replaceAll("[^\\w.-]", "_"); }

    private static void write(File f, byte[] data) throws Exception {
        try (FileOutputStream o = new FileOutputStream(f)) { o.write(data); }
    }

    private static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException ignored) { } }

    static void deleteRec(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteRec(k);
        f.delete();
    }
}
