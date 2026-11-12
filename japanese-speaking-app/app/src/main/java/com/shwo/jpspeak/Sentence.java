package com.shwo.jpspeak;

import java.util.ArrayList;
import java.util.List;

/** 연습 문장 하나. [한자|읽기|다른읽기...] 표기를 조각(Seg) 단위로 나눠 보관한다. */
public final class Sentence {

    /** 문장을 이루는 한 조각: 가나 한 글자, 후리가나가 붙은 한자 묶음, 또는 문장부호. */
    public static final class Seg {
        public final String display;   // 화면에 크게 보이는 글자
        public final String ruby;      // 위에 작게 보이는 후리가나 (없으면 null)
        public final String[] alts;    // 정답으로 인정하는 표기들 (정규화된 형태)
        public final boolean scored;   // 채점 대상인지 (문장부호는 false)

        Seg(String display, String ruby, String[] alts, boolean scored) {
            this.display = display;
            this.ruby = ruby;
            this.alts = alts;
            this.scored = scored;
        }
    }

    public final String id;
    public final String level;
    public final int number;       // 레벨 안에서의 번호 (1부터)
    public final String korean;
    public final List<Seg> segs;

    private Sentence(String id, String level, int number, String korean, List<Seg> segs) {
        this.id = id;
        this.level = level;
        this.number = number;
        this.korean = korean;
        this.segs = segs;
    }

    /** 화면 표시·음성 합성용 원문 (예: 私は学生です。) */
    public String text() {
        StringBuilder sb = new StringBuilder();
        for (Seg s : segs) sb.append(s.display);
        return sb.toString();
    }

    /** 전체 히라가나 읽기 (예: わたしはがくせいです。) */
    public String reading() {
        StringBuilder sb = new StringBuilder();
        for (Seg s : segs) sb.append(s.ruby != null ? s.ruby : s.display);
        return sb.toString();
    }

    public static Sentence parse(String level, int number, String markup, String korean) {
        List<Seg> segs = new ArrayList<>();
        int i = 0;
        while (i < markup.length()) {
            char c = markup.charAt(i);
            if (c == '[') {
                int end = markup.indexOf(']', i);
                if (end < 0) throw new IllegalArgumentException("닫는 ] 없음: " + markup);
                String[] parts = markup.substring(i + 1, end).split("\\|");
                String display = parts[0];
                String ruby = parts.length > 1 && !parts[1].isEmpty() ? parts[1] : null;
                List<String> alts = new ArrayList<>();
                for (String p : parts) {
                    String n = JaText.normalize(p);
                    if (!n.isEmpty() && !alts.contains(n)) alts.add(n);
                }
                segs.add(new Seg(display, ruby, alts.toArray(new String[0]), !alts.isEmpty()));
                i = end + 1;
            } else {
                int cp = markup.codePointAt(i);
                String ch = new String(Character.toChars(cp));
                String n = JaText.normalize(ch);
                segs.add(new Seg(ch, null, n.isEmpty() ? new String[0] : new String[]{n}, !n.isEmpty()));
                i += Character.charCount(cp);
            }
        }
        return new Sentence(level + "_" + number, level, number, korean, segs);
    }
}
