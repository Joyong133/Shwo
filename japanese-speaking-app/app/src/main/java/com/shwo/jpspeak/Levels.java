package com.shwo.jpspeak;

import android.content.Context;
import android.content.res.AssetManager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 레벨 정보와 assets/sentences/*.txt 에 들어 있는 문장 목록. */
public final class Levels {
    private Levels() {}

    public static final String[] CODES = {"n5", "n4", "n3", "n2", "n1"};
    public static final String[] NAMES = {"기초 (N5)", "N4", "N3", "N2", "N1"};
    public static final String[] DESCS = {
            "인사 · 자기소개 · 일상 표현",
            "~てもいい · ~たら · ~そうだ 등 기본 문형",
            "~とたん · ~うちに · ~によると 등 중급 문형",
            "~ざるを得ない · ~にもかかわらず 등 상급 문형",
            "~や否や · ~を余儀なくされる 등 고급 문형",
    };

    private static final Map<String, List<Sentence>> cache = new HashMap<>();

    public static int indexOf(String code) {
        for (int i = 0; i < CODES.length; i++) if (CODES[i].equals(code)) return i;
        return -1;
    }

    public static String name(String code) {
        int i = indexOf(code);
        return i >= 0 ? NAMES[i] : code;
    }

    public static synchronized List<Sentence> sentences(Context ctx, String code) {
        List<Sentence> list = cache.get(code);
        if (list != null) return list;
        list = new ArrayList<>();
        AssetManager am = ctx.getAssets();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                am.open("sentences/" + code + ".txt"), StandardCharsets.UTF_8))) {
            String line;
            int number = 0;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] cols = line.split("\t");
                number++;
                list.add(Sentence.parse(code, number, cols[0].trim(), cols.length > 1 ? cols[1].trim() : ""));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        cache.put(code, list);
        return list;
    }

    public static List<Sentence> all(Context ctx) {
        List<Sentence> all = new ArrayList<>();
        for (String c : CODES) all.addAll(sentences(ctx, c));
        return all;
    }
}
