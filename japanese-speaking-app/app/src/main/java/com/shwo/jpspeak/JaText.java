package com.shwo.jpspeak;

/** 음성 인식 결과와 정답을 비교하기 전에 표기 차이를 없애는 정규화. */
public final class JaText {
    private JaText() {}

    private static final String KANJI_DIGITS = "〇一二三四五六七八九";

    /**
     * - 문장부호·공백 제거 (글자와 숫자만 남김)
     * - 가타카나 → 히라가나
     * - 전각 영숫자 → 반각, 소문자화
     * - 한자 숫자(一, 二 …) → 아라비아 숫자 (인식기가 "1度", "一度" 어느 쪽으로 써도 같게)
     */
    public static String normalize(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder(s.length());
        for (int i = 0; i < s.length(); ) {
            int c = s.codePointAt(i);
            i += Character.charCount(c);
            if (c >= 0xFF01 && c <= 0xFF5E) c -= 0xFEE0;            // 전각 → 반각
            if (c >= 0x30A1 && c <= 0x30F6) c -= 0x60;              // 가타카나 → 히라가나
            int d = KANJI_DIGITS.indexOf(c);
            if (d >= 0) c = '0' + d;
            if (!Character.isLetterOrDigit(c)) continue;            // 。、？！「」 공백 등 제거
            sb.appendCodePoint(Character.toLowerCase(c));
        }
        return sb.toString();
    }

    /** 두 문자열의 편집 거리 (레벤슈타인). */
    public static int editDistance(String a, String b) {
        int n = a.length(), m = b.length();
        if (n == 0) return m;
        if (m == 0) return n;
        int[] prev = new int[m + 1], cur = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            cur[0] = i;
            char ca = a.charAt(i - 1);
            for (int j = 1; j <= m; j++) {
                int cost = ca == b.charAt(j - 1) ? 0 : 1;
                cur[j] = Math.min(Math.min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }
            int[] t = prev; prev = cur; cur = t;
        }
        return prev[m];
    }
}
