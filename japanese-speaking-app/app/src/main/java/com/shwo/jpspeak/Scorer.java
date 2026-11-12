package com.shwo.jpspeak;

import java.util.ArrayList;
import java.util.List;

/**
 * 인식된 문장을 정답 문장과 비교해 일치율(%)을 계산한다.
 *
 * 문장의 각 조각(한자 묶음은 "한자 표기" 또는 "읽기" 둘 다 정답)을 인식 결과의 구간에
 * 동적 계획법으로 맞춰서, 최소 편집 비용을 구한다. 그래서 인식기가 「猫」를 「ねこ」로
 * 적어 줘도 감점되지 않는다. 어느 조각이 틀렸는지도 함께 알려 준다.
 */
public final class Scorer {
    private Scorer() {}

    public static final class Result {
        public final int percent;
        public final boolean[] segOk;   // Sentence.segs 와 같은 순서. 문장부호는 true
        public final String heard;      // 채점에 쓰인 인식 결과

        Result(int percent, boolean[] segOk, String heard) {
            this.percent = percent;
            this.segOk = segOk;
            this.heard = heard;
        }
    }

    /** 인식기가 준 여러 후보 중 가장 점수가 높은 것을 고른다. */
    public static Result best(Sentence s, List<String> candidates) {
        Result best = null;
        if (candidates != null) {
            for (String c : candidates) {
                if (c == null) continue;
                Result r = score(s, c);
                if (best == null || r.percent > best.percent) best = r;
            }
        }
        return best != null ? best : score(s, "");
    }

    public static Result score(Sentence s, String heardRaw) {
        String rec = JaText.normalize(heardRaw);
        int n = rec.length();

        List<Integer> idx = new ArrayList<>();
        for (int i = 0; i < s.segs.size(); i++) if (s.segs.get(i).scored) idx.add(i);
        int k = idx.size();

        boolean[] ok = new boolean[s.segs.size()];
        for (int i = 0; i < ok.length; i++) ok[i] = !s.segs.get(i).scored;
        if (k == 0) return new Result(100, ok, heardRaw);

        final int INF = 1 << 29;
        int[][] dp = new int[k + 1][n + 1];
        int[][] back = new int[k + 1][n + 1];
        int[][] unitCost = new int[k + 1][n + 1];
        for (int[] row : dp) java.util.Arrays.fill(row, INF);
        for (int i = 0; i <= n; i++) dp[0][i] = i;    // 문장 앞에 붙은 잡음은 글자당 1점 감점

        int base = 0; // 아무 말도 안 했을 때의 비용 = 만점 기준
        for (int u = 0; u < k; u++) {
            String[] alts = s.segs.get(idx.get(u)).alts;
            int minLen = Integer.MAX_VALUE, maxLen = 0;
            for (String a : alts) {
                minLen = Math.min(minLen, a.length());
                maxLen = Math.max(maxLen, a.length());
            }
            base += minLen;
            for (int i = 0; i <= n; i++) {
                if (dp[u][i] >= INF) continue;
                int maxL = Math.min(n - i, maxLen + 2);
                for (int len = 0; len <= maxL; len++) {
                    String sub = rec.substring(i, i + len);
                    int c = INF;
                    for (String a : alts) c = Math.min(c, JaText.editDistance(a, sub));
                    int v = dp[u][i] + c;
                    if (v < dp[u + 1][i + len]) {
                        dp[u + 1][i + len] = v;
                        back[u + 1][i + len] = i;
                        unitCost[u + 1][i + len] = c;
                    }
                }
            }
        }

        int total = INF, end = 0;
        for (int i = 0; i <= n; i++) {
            int v = dp[k][i] + (n - i);   // 문장 뒤에 붙은 잡음
            if (v < total) { total = v; end = i; }
        }

        int pos = end;
        for (int u = k; u >= 1; u--) {
            ok[idx.get(u - 1)] = unitCost[u][pos] == 0;
            pos = back[u][pos];
        }

        double ratio = 1.0 - (double) total / Math.max(1, base);
        int percent = (int) Math.round(Math.max(0, ratio) * 100);
        return new Result(percent, ok, heardRaw);
    }
}
