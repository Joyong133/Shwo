package com.shwo.qpbridge;

import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.CRC32;

/** 파일 전송 메시지 만들기/읽기와 받는 쪽 검사 (안드로이드 의존성 없음 → PC 에서 시험 가능). */
public final class FileCodec {
    private FileCodec() {}

    public static final class Offer {
        public final long id, size;
        public final String name, mime;

        public Offer(long id, long size, String name, String mime) {
            this.id = id;
            this.size = size;
            this.name = name;
            this.mime = mime;
        }
    }

    public static byte[] offer(long id, long size, String name, String mime) {
        try {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            DataOutputStream o = new DataOutputStream(bo);
            o.writeLong(id);
            o.writeLong(size);
            o.writeUTF(name);
            o.writeUTF(mime == null ? "" : mime);
            return bo.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    public static Offer readOffer(byte[] p) throws IOException {
        DataInputStream in = new DataInputStream(new java.io.ByteArrayInputStream(p));
        long id = in.readLong(), size = in.readLong();
        String name = safeName(in.readUTF());
        String mime = in.readUTF();
        return new Offer(id, size, name, mime.isEmpty() ? null : mime);
    }

    public static byte[] chunk(long id, long offset, byte[] data, int len) {
        byte[] p = new byte[16 + len];
        java.nio.ByteBuffer.wrap(p).putLong(id).putLong(offset).put(data, 0, len);
        return p;
    }

    public static byte[] end(long id, long size, long crc) {
        return java.nio.ByteBuffer.allocate(24).putLong(id).putLong(size).putLong(crc).array();
    }

    public static byte[] idAndText(long id, String text) {
        byte[] t = Proto.utf8(text);
        return java.nio.ByteBuffer.allocate(8 + t.length).putLong(id).put(t).array();
    }

    public static byte[] done(long id, boolean ok, String where) {
        byte[] t = Proto.utf8(where);
        return java.nio.ByteBuffer.allocate(9 + t.length).putLong(id).put((byte) (ok ? 1 : 0)).put(t).array();
    }

    public static long readId(byte[] p) {
        return java.nio.ByteBuffer.wrap(p).getLong();
    }

    /** 경로 문자 제거, 빈 이름 방지 */
    public static String safeName(String n) {
        if (n == null) n = "";
        n = n.replace('/', '_').replace('\\', '_').replace("\0", "").trim();
        while (n.startsWith(".")) n = n.substring(1);
        if (n.isEmpty()) n = "file";
        if (n.length() > 120) {
            int dot = n.lastIndexOf('.');
            String ext = dot > 0 && n.length() - dot <= 10 ? n.substring(dot) : "";
            n = n.substring(0, 120 - ext.length()) + ext;
        }
        return n;
    }

    /** 받는 중인 파일 하나: 순서·크기·CRC 를 확인하며 씀 */
    public static final class Incoming {
        public final Offer offer;
        private final OutputStream out;
        private final CRC32 crc = new CRC32();
        public long written;

        public Incoming(Offer offer, OutputStream out) {
            this.offer = offer;
            this.out = out;
        }

        /** CHUNK 메시지 처리. 문제가 있으면 IOException(이유) */
        public void onChunk(byte[] p) throws IOException {
            java.nio.ByteBuffer b = java.nio.ByteBuffer.wrap(p);
            b.getLong();
            long off = b.getLong();
            if (off != written) throw new IOException("중간 데이터가 빠졌어요 (" + written + " 대신 " + off + ")");
            int len = p.length - 16;
            if (written + len > offer.size) throw new IOException("파일 크기가 맞지 않아요");
            out.write(p, 16, len);
            crc.update(p, 16, len);
            written += len;
        }

        /** END 메시지 처리. 맞으면 스트림을 닫고 정상 종료, 아니면 IOException */
        public void onEnd(byte[] p) throws IOException {
            java.nio.ByteBuffer b = java.nio.ByteBuffer.wrap(p);
            b.getLong();
            long size = b.getLong(), c = b.getLong();
            out.close();
            if (size != written || size != offer.size) throw new IOException("받은 크기가 달라요 (" + written + "/" + size + ")");
            if (c != crc.getValue()) throw new IOException("내용이 손상됐어요 (CRC 불일치)");
        }

        public void abort() {
            try {
                out.close();
            } catch (IOException ignored) {
            }
        }
    }
}
