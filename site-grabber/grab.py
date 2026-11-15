#!/usr/bin/env python3
"""사이트 통째로 가져오기 (site-grabber)

링크 하나를 넣으면 같은 사이트 안의 페이지들을 따라가면서
HTML, 본문 텍스트, 이미지, 첨부파일을 전부 저장합니다.

사용법
  python grab.py                         # 실행 후 주소를 물어봄
  python grab.py https://example.com/
  python grab.py https://example.com/blog/ --max-pages 500 --delay 0.5
  python grab.py https://example.com/ --js     # 자바스크립트로 그려지는 사이트 (playwright 필요)

결과 (기본: ./grabbed/<도메인>/)
  pages/        각 페이지의 원본 HTML
  text/         각 페이지의 본문 텍스트
  files/        이미지·PDF 등 첨부파일
  all_text.txt  모든 페이지 텍스트를 한 파일로
  pages.csv     주소, 제목, 저장 위치 목록
"""
import argparse
import csv
import hashlib
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from collections import deque
from html.parser import HTMLParser

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 site-grabber/1.0"
FILE_EXT = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico", ".avif",
    ".pdf", ".zip", ".hwp", ".hwpx", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".txt", ".csv", ".mp3", ".mp4", ".webm", ".mov",
}
SKIP_TAGS = {"script", "style", "noscript", "template", "svg", "head"}
BLOCK_TAGS = {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6",
              "article", "section", "header", "footer", "blockquote", "pre", "table", "ul", "ol", "dd", "dt"}


class PageParser(HTMLParser):
    """링크, 이미지/파일 주소, 제목, 본문 텍스트를 뽑는다."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.files, self.parts = [], [], []
        self.title, self._in_title, self._skip, self.base = "", False, 0, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in SKIP_TAGS:
            self._skip += 1
        if tag == "title":
            self._in_title = True
        if tag == "base" and a.get("href"):
            self.base = a["href"]
        if tag in ("a", "area") and a.get("href"):
            self.links.append(a["href"])
        if tag in ("img", "source", "video", "audio", "embed"):
            for key in ("src", "data-src", "data-original", "data-lazy-src"):
                if a.get(key):
                    self.files.append(a[key])
            if a.get("srcset"):
                self.files += [s.strip().split(" ")[0] for s in a["srcset"].split(",") if s.strip()]
        if tag == "iframe" and a.get("src"):
            self.links.append(a["src"])
        if tag == "link" and a.get("href") and "icon" in (a.get("rel") or ""):
            self.files.append(a["href"])
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self._skip:
            self._skip -= 1
        if tag == "title":
            self._in_title = False
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        elif not self._skip:
            self.parts.append(data)

    def text(self):
        raw = "".join(self.parts)
        lines = [re.sub(r"[ \t\u00a0]+", " ", l).strip() for l in raw.splitlines()]
        out, blank = [], False
        for l in lines:
            if l:
                out.append(l)
                blank = False
            elif not blank and out:
                out.append("")
                blank = True
        return "\n".join(out).strip()


def normalize(url):
    url, _ = urllib.parse.urldefrag(url)
    p = urllib.parse.urlsplit(url)
    path = p.path or "/"
    return urllib.parse.urlunsplit((p.scheme.lower(), p.netloc.lower(), path, p.query, ""))


def safe_name(url, default_ext):
    """주소를 파일 경로로 바꾼다 (폴더 구조 유지, 너무 긴 이름은 해시로 줄임)."""
    p = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(p.path)
    if path.endswith("/") or not path:
        path += "index"
    parts = [re.sub(r'[<>:"\\|?*\x00-\x1f]', "_", s)[:80] for s in path.split("/") if s not in ("", ".", "..")]
    if not parts:
        parts = ["index"]
    stem, ext = os.path.splitext(parts[-1])
    if p.query:
        stem += "_" + hashlib.md5(p.query.encode()).hexdigest()[:8]
    if not ext or (default_ext == ".html" and ext.lower() not in (".html", ".htm")):
        ext = (ext + default_ext) if default_ext == ".html" and ext else (ext or default_ext)
    parts[-1] = stem + ext
    return os.path.join(*parts)


def decode(body, content_type):
    m = re.search(r"charset=([\w-]+)", content_type or "", re.I)
    cands = [m.group(1)] if m else []
    m2 = re.search(rb'<meta[^>]+charset=["\']?([\w-]+)', body[:4000], re.I)
    if m2:
        cands.append(m2.group(1).decode("ascii", "ignore"))
    cands += ["utf-8", "cp949"]
    for enc in cands:
        try:
            return body.decode(enc)
        except (LookupError, UnicodeDecodeError):
            continue
    return body.decode("utf-8", "replace")


class Grabber:
    def __init__(self, start, out, max_pages, delay, max_file_mb, scope_path, all_files, use_js, ignore_robots, cookie):
        self.start = normalize(start)
        sp = urllib.parse.urlsplit(self.start)
        self.host = sp.netloc
        self.scope = (sp.path.rsplit("/", 1)[0] + "/") if scope_path else "/"
        self.out = os.path.join(out, re.sub(r"[^\w.-]", "_", self.host))
        self.max_pages, self.delay, self.max_file = max_pages, delay, max_file_mb * 1024 * 1024
        self.all_files, self.cookie = all_files, cookie
        self.seen_pages, self.seen_files = set(), set()
        self.rows, self.stats = [], {"pages": 0, "files": 0, "errors": 0}
        self.robots = None
        if not ignore_robots:
            self.robots = urllib.robotparser.RobotFileParser(f"{sp.scheme}://{self.host}/robots.txt")
            try:
                self.robots.read()
            except Exception:
                self.robots = None
        self.browser = None
        if use_js:
            try:
                from playwright.sync_api import sync_playwright
            except ImportError:
                sys.exit("--js 를 쓰려면 먼저:  pip install playwright  &&  playwright install chromium")
            self._pw = sync_playwright().start()
            self.browser = self._pw.chromium.launch()
            self.page = self.browser.new_page(user_agent=UA)

    def in_scope(self, url):
        p = urllib.parse.urlsplit(url)
        host = p.netloc
        same = host == self.host or host.removeprefix("www.") == self.host.removeprefix("www.")
        return p.scheme in ("http", "https") and same and p.path.startswith(self.scope)

    def allowed(self, url):
        return self.robots is None or self.robots.can_fetch(UA, url)

    def fetch(self, url):
        headers = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
        if self.cookie:
            headers["Cookie"] = self.cookie
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as r:
            ctype = r.headers.get("Content-Type", "")
            size = int(r.headers.get("Content-Length") or 0)
            if size and size > self.max_file and "html" not in ctype:
                raise ValueError(f"너무 큼 ({size // 1048576}MB)")
            body = r.read(self.max_file + 1)
            if len(body) > self.max_file and "html" not in ctype:
                raise ValueError("너무 큼")
            return r.geturl(), ctype, body

    def save(self, sub, rel, data):
        path = os.path.join(self.out, sub, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        mode = "w" if isinstance(data, str) else "wb"
        with open(path, mode, **({"encoding": "utf-8"} if mode == "w" else {})) as f:
            f.write(data)
        return os.path.relpath(path, self.out)

    def grab_file(self, url):
        url = normalize(url)
        if url in self.seen_files or not url.startswith("http"):
            return
        self.seen_files.add(url)
        try:
            final, ctype, body = self.fetch(url)
            ext = os.path.splitext(urllib.parse.urlsplit(final).path)[1] or guess_ext(ctype)
            host = urllib.parse.urlsplit(final).netloc
            rel = os.path.join(re.sub(r"[^\w.-]", "_", host), safe_name(final, ext))
            self.save("files", rel, body)
            self.stats["files"] += 1
        except Exception as e:
            self.stats["errors"] += 1
            log(f"  ! 파일 실패 {url} ({e})")

    def render(self, url):
        resp = self.page.goto(url, wait_until="networkidle", timeout=45000)
        html = self.page.content()
        ctype = (resp.headers.get("content-type") if resp else "") or "text/html"
        return self.page.url, ctype, html.encode("utf-8")

    def run(self):
        os.makedirs(self.out, exist_ok=True)
        queue = deque([self.start])
        self.seen_pages.add(self.start)
        all_text = open(os.path.join(self.out, "all_text.txt"), "w", encoding="utf-8")
        log(f"시작: {self.start}  (범위 {self.host}{self.scope}, 최대 {self.max_pages}페이지)")
        log(f"저장 위치: {os.path.abspath(self.out)}")
        try:
            while queue and self.stats["pages"] < self.max_pages:
                url = queue.popleft()
                if not self.allowed(url):
                    log(f"  - robots.txt 금지: {url}")
                    continue
                try:
                    final, ctype, body = self.render(url) if self.browser else self.fetch(url)
                except urllib.error.HTTPError as e:
                    self.stats["errors"] += 1
                    log(f"  ! {e.code} {url}")
                    continue
                except Exception as e:
                    self.stats["errors"] += 1
                    log(f"  ! 실패 {url} ({e})")
                    continue
                final = normalize(final)
                head = body[:512].lstrip().lower()
                if "html" not in ctype.lower() and not head.startswith((b"<!doctype html", b"<html")):
                    # 링크가 파일(이미지/PDF 등)을 가리키는 경우
                    if final not in self.seen_files:
                        self.seen_files.add(final)
                        ext = os.path.splitext(urllib.parse.urlsplit(final).path)[1] or guess_ext(ctype)
                        self.save("files", os.path.join(re.sub(r"[^\w.-]", "_", self.host), safe_name(final, ext)), body)
                        self.stats["files"] += 1
                    continue
                html = decode(body, ctype)
                parser = PageParser()
                try:
                    parser.feed(html)
                except Exception:
                    pass
                base = urllib.parse.urljoin(final, parser.base) if parser.base else final
                title = re.sub(r"\s+", " ", parser.title).strip()
                text = parser.text()
                html_path = self.save("pages", safe_name(final, ".html"), html)
                text_path = self.save("text", safe_name(final, ".txt").rsplit(".", 1)[0] + ".txt", f"{title}\n{final}\n\n{text}\n")
                all_text.write(f"\n{'=' * 80}\n{title}\n{final}\n{'=' * 80}\n{text}\n")
                self.rows.append([final, title, html_path, text_path, len(text)])
                self.stats["pages"] += 1
                log(f"[{self.stats['pages']}/{self.max_pages}] {title[:40] or '(제목 없음)'}  {final}")

                for href in parser.links:
                    u = urllib.parse.urljoin(base, href.strip())
                    if not u.startswith("http"):
                        continue
                    u = normalize(u)
                    if os.path.splitext(urllib.parse.urlsplit(u).path)[1].lower() in FILE_EXT:
                        if self.in_scope(u) or self.all_files:
                            self.grab_file(u)
                        continue
                    if self.in_scope(u) and u not in self.seen_pages:
                        self.seen_pages.add(u)
                        queue.append(u)
                for src in parser.files:
                    u = urllib.parse.urljoin(base, src.strip())
                    if u.startswith("http"):
                        self.grab_file(u)  # 페이지에 박힌 이미지는 다른 도메인(CDN)이어도 저장
                time.sleep(self.delay)
        except KeyboardInterrupt:
            log("\n중단됨 — 지금까지 받은 것을 저장합니다.")
        finally:
            all_text.close()
            with open(os.path.join(self.out, "pages.csv"), "w", newline="", encoding="utf-8-sig") as f:
                w = csv.writer(f)
                w.writerow(["url", "title", "html", "text", "text_chars"])
                w.writerows(self.rows)
            if self.browser:
                self.browser.close()
                self._pw.stop()
        left = len(queue)
        log(f"\n완료: 페이지 {self.stats['pages']}개, 파일 {self.stats['files']}개, 실패 {self.stats['errors']}개")
        if left:
            log(f"  (아직 안 받은 페이지 {left}개 남음 — --max-pages 를 늘려 다시 실행하세요)")
        log(f"결과 폴더: {os.path.abspath(self.out)}")


def guess_ext(ctype):
    ctype = (ctype or "").split(";")[0].strip().lower()
    return {"image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp",
            "image/svg+xml": ".svg", "application/pdf": ".pdf", "video/mp4": ".mp4",
            "image/avif": ".avif", "image/x-icon": ".ico"}.get(ctype, ".bin")


def log(msg):
    print(msg, flush=True)


def main():
    ap = argparse.ArgumentParser(description="링크 하나로 사이트 내용 통째로 가져오기")
    ap.add_argument("url", nargs="?", help="시작 주소 (예: https://example.com/)")
    ap.add_argument("-o", "--out", default="grabbed", help="저장 폴더 (기본 grabbed)")
    ap.add_argument("-n", "--max-pages", type=int, default=300, help="최대 페이지 수 (기본 300)")
    ap.add_argument("-d", "--delay", type=float, default=1.0, help="페이지 사이 대기 초 (기본 1초, 서버 부담 줄이기)")
    ap.add_argument("--max-file-mb", type=int, default=50, help="파일 하나 최대 크기 MB (기본 50)")
    ap.add_argument("--whole-site", action="store_true", help="시작 주소의 하위 경로뿐 아니라 사이트 전체를 따라감")
    ap.add_argument("--no-files", action="store_true", help="이미지·첨부파일은 받지 않음")
    ap.add_argument("--js", action="store_true", help="자바스크립트로 그려지는 사이트용 (playwright 필요)")
    ap.add_argument("--ignore-robots", action="store_true", help="robots.txt 무시 (본인 사이트일 때만)")
    ap.add_argument("--cookie", help="로그인이 필요한 경우 브라우저의 Cookie 헤더 값")
    a = ap.parse_args()

    url = a.url
    if not url:
        url = input("가져올 웹사이트 주소를 입력하세요: ").strip()
        if not url:
            sys.exit("주소가 없습니다.")
        n = input(f"최대 몇 페이지까지 받을까요? [엔터 = {a.max_pages}]: ").strip()
        if n.isdigit():
            a.max_pages = int(n)
    if not re.match(r"^https?://", url):
        url = "https://" + url

    g = Grabber(url, a.out, a.max_pages, a.delay, a.max_file_mb, not a.whole_site,
                True, a.js, a.ignore_robots, a.cookie)
    if a.no_files:
        g.grab_file = lambda u: None
    g.run()
    if not a.url and os.name == "nt":
        input("\n엔터를 누르면 창을 닫습니다...")


if __name__ == "__main__":
    main()
