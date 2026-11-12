// Road signs with real place names (gantries, distance boards, region boards, message signs).
#include "world.h"

namespace {
struct Fr { Vec3 c, fwd, right; float g, W, eL, eR; int kind; uint16_t flags; };
Fr frameAt(const Route& R, int i, const Vec3d& origin) {
    Fr f; int a = std::max(i - 1, 0), b = std::min(i + 1, R.N - 1);
    f.fwd = normalize(Vec3((float)(R.x[b] - R.x[a]), 0, (float)(R.z[b] - R.z[a]))); f.right = Vec3(-f.fwd.z, 0, f.fwd.x);
    f.c = Vec3((float)(R.x[i] - origin.x), R.y[i] - (float)origin.y, (float)(R.z[i] - origin.z));
    f.g = 0; f.W = R.W[i]; f.eL = R.extL[i]; f.eR = R.extR[i]; f.kind = R.kind[i]; f.flags = R.flags[i];
    return f;
}
// flat panel facing the oncoming traffic (normal = -fwd); l0..l1 lateral, h0..h1 height above the road
void panel(MeshData& L, const Fr& f, float l0, float l1, float h0, float h1, int colr, uint8_t mat, float back = 0.f) {
    L.mat = mat; L.layer = -1; L.color(colr);
    Vec3 o = f.c - f.fwd * back;
    L.quad(o + f.right * l0 + Vec3(0, h0, 0), o + f.right * l1 + Vec3(0, h0, 0), o + f.right * l1 + Vec3(0, h1, 0), o + f.right * l0 + Vec3(0, h1, 0));
}
void textAt(MeshData& T, const Font& font, const Fr& f, const char* s, float lc, float h, float size, int colr, uint8_t mat, int align = 1) {
    T.mat = mat; T.color(colr);
    Vec3 o = f.c - f.fwd * 0.06f + f.right * lc + Vec3(0, h, 0);
    font.draw(T, s, o, f.right, Vec3(0, 1, 0), size, align);
}
void post(MeshData& L, const Vec3& a, const Vec3& b, float r, int colr) { L.mat = MAT_LIT; L.layer = -1; L.color(colr); L.cylinder(Mat4::identity(), a, b, r, r, 6, false); }
}

void World::genSigns(int i0, int i1, int lod, ChunkData& out) {
    const Route& R = d.route;
    if (!font) return;
    MeshData& L = out.lit; MeshData& T = out.text;
    auto inChunk = [&](float s, int& i) { i = (int)lroundf(s / R.step); return i >= i0 && i < i1 && i > 2 && i < R.N - 3; };
    const int GREEN = 0x0c6b45, BLUE = 0x1b4f9c, WHITE = 0xf4f4ee, BROWN = 0x6a4a2c;

    // ---- overhead gantries announcing each interchange / junction / rest area
    for (const Place& p : R.places) {
        static const float before[3] = {2000.f, 1000.f, 280.f};
        for (int b = 0; b < 3; b++) {
            int i; if (!inChunk(p.s - before[b], i)) continue;
            if (R.kind[i] != RK_EXP || (R.flags[i] & (RF_TUNNEL | RF_TOLL))) continue;
            Fr f = frameAt(R, i, out.origin);
            float lm = -f.W / 2 - 1.6f, lr = f.W / 2 + 3.9f;
            post(L, f.c + f.right * lm, f.c + f.right * lm + Vec3(0, 8.6f, 0), 0.16f, 0x8a9096);
            post(L, f.c + f.right * lr, f.c + f.right * lr + Vec3(0, 8.6f, 0), 0.16f, 0x8a9096);
            L.color(0x8a9096);
            L.box(Mat4::basis(f.right, Vec3(0, 1, 0), -f.fwd, f.c), Vec3(lm, 7.9f, -0.18f), Vec3(lr, 8.5f, 0.18f));
            bool rest = p.type == PT_REST || p.type == PT_STOP;
            float pw = std::min(f.W * 0.62f, 9.5f), pc = f.W / 2 - pw / 2 + 1.2f;    // sits over the right-hand lanes (exits are on the right)
            int bg = rest ? BLUE : GREEN;
            panel(L, f, pc - pw / 2 - 0.08f, pc + pw / 2 + 0.08f, 5.42f, 8.38f, WHITE, MAT_SIGN, 0.20f);
            panel(L, f, pc - pw / 2, pc + pw / 2, 5.5f, 8.3f, bg, MAT_SIGN, 0.23f);
            Fr ft = f; ft.c = f.c - f.fwd * 0.23f;
            char line2[64];
            const char* what = p.type == PT_JC ? "분기점" : (rest ? "휴게소" : (p.type == PT_TG ? "요금소" : "출구"));
            if (b == 2) snprintf(line2, sizeof(line2), "%s ↗", what); else snprintf(line2, sizeof(line2), "%s %dkm", what, b == 0 ? 2 : 1);
            float nameSize = std::min(1.05f, pw * 0.82f / std::max(font->width(p.name.c_str(), 1.f), 0.1f));
            textAt(T, *font, ft, p.name.c_str(), pc, 7.0f, nameSize, WHITE, MAT_SIGN);
            textAt(T, *font, ft, line2, pc, 5.85f, 0.62f, 0xffe27a, MAT_SIGN);
            // through-traffic panel over the left lanes
            float qw = std::min(f.W * 0.3f, 4.6f), qc = -f.W / 2 + qw / 2 + 0.6f;
            panel(L, f, qc - qw / 2 - 0.08f, qc + qw / 2 + 0.08f, 5.92f, 8.38f, WHITE, MAT_SIGN, 0.20f);
            panel(L, f, qc - qw / 2, qc + qw / 2, 6.0f, 8.3f, GREEN, MAT_SIGN, 0.23f);
            const char* thru = p.s < R.places[28].s ? "대전" : (p.s < R.places[48].s ? "대구" : "부산");
            textAt(T, *font, ft, thru, qc, 7.15f, 0.8f, WHITE, MAT_SIGN);
            textAt(T, *font, ft, "↑", qc, 6.2f, 0.75f, WHITE, MAT_SIGN);
        }
        // roadside distance board shortly after each interchange
        int i;
        if ((p.type == PT_IC || p.type == PT_JC) && inChunk(p.s + 750.f, i) && R.kind[i] == RK_EXP && !(R.flags[i] & (RF_TUNNEL | RF_TOLL | RF_REST | RF_BRIDGE))) {
            Fr f = frameAt(R, i, out.origin);
            float lc = f.eR + 3.4f + ((R.flags[i] & RF_BARR) ? 1.2f : 0.f);
            post(L, f.c + f.right * (lc - 1.5f), f.c + f.right * (lc - 1.5f) + Vec3(0, 5.2f, 0), 0.09f, 0x8a9096);
            post(L, f.c + f.right * (lc + 1.5f), f.c + f.right * (lc + 1.5f) + Vec3(0, 5.2f, 0), 0.09f, 0x8a9096);
            panel(L, f, lc - 2.38f, lc + 2.38f, 2.52f, 5.48f, WHITE, MAT_SIGN, 0.12f);
            panel(L, f, lc - 2.3f, lc + 2.3f, 2.6f, 5.4f, GREEN, MAT_SIGN, 0.15f);
            Fr ft = f; ft.c = f.c - f.fwd * 0.15f;
            struct Dest { const char* n; int place; };
            static const Dest dests[] = {{"수원", 5}, {"천안", 17}, {"대전", 28}, {"김천", 37}, {"대구", 48}, {"경주", 56}, {"부산", -1}};
            int shown = 0; float y = 4.55f;
            for (const Dest& ds : dests) {
                float sd = ds.place >= 0 && ds.place < (int)R.places.size() ? R.places[ds.place].s : R.length();
                float km = (sd - p.s - 750.f) / 1000.f;
                if (km < 4.f) continue;
                if (shown >= 2 && ds.place >= 0) continue;        // two nearest cities, then always 부산
                char buf[48]; snprintf(buf, sizeof(buf), "%dkm", (int)lroundf(km));
                textAt(T, *font, ft, ds.n, lc - 2.0f, y, 0.62f, WHITE, MAT_SIGN, 0);
                textAt(T, *font, ft, buf, lc + 2.05f, y, 0.62f, WHITE, MAT_SIGN, 2);
                y -= 0.88f; shown++;
                if (shown >= 3) break;
            }
        }
    }
    // ---- region boards
    for (auto& rg : R.regions) {
        int i; if (rg.first < 1000.f || !inChunk(rg.first, i) || R.kind[i] != RK_EXP || (R.flags[i] & (RF_TUNNEL | RF_TOLL | RF_REST | RF_BRIDGE))) continue;
        Fr f = frameAt(R, i, out.origin);
        float lc = f.eR + 3.6f + ((R.flags[i] & RF_BARR) ? 1.2f : 0.f);
        float w = std::max(font->width(rg.second.c_str(), 0.55f) + 0.7f, 3.f);
        post(L, f.c + f.right * (lc - w * 0.3f), f.c + f.right * (lc - w * 0.3f) + Vec3(0, 3.9f, 0), 0.09f, 0x8a9096);
        post(L, f.c + f.right * (lc + w * 0.3f), f.c + f.right * (lc + w * 0.3f) + Vec3(0, 3.9f, 0), 0.09f, 0x8a9096);
        panel(L, f, lc - w / 2, lc + w / 2, 2.6f, 4.2f, BROWN, MAT_SIGN, 0.15f);
        Fr ft = f; ft.c = f.c - f.fwd * 0.15f;
        textAt(T, *font, ft, rg.second.c_str(), lc, 3.25f, 0.55f, WHITE, MAT_SIGN);
        textAt(T, *font, ft, "어서 오십시오", lc, 2.75f, 0.3f, 0xffe9b0, MAT_SIGN);
    }
    // ---- variable message signs (amber LEDs) every ~17 km
    if (lod <= 1) {
        static const char* msgs[] = {"전 좌석 안전띠 착용", "졸음운전 주의  쉬어가세요", "앞차와 안전거리 확보", "버스전용차로 단속중", "터널 안 차로변경 금지", "안전운전 하세요"};
        for (float s = 9000.f; s < R.length() - 9000.f; s += 17300.f) {
            int i; if (!inChunk(s, i) || R.kind[i] != RK_EXP || (R.flags[i] & (RF_TUNNEL | RF_TOLL | RF_REST))) continue;
            Fr f = frameAt(R, i, out.origin);
            float lm = -f.W / 2 - 1.6f, lr = f.W / 2 + 3.9f;
            post(L, f.c + f.right * lm, f.c + f.right * lm + Vec3(0, 8.4f, 0), 0.16f, 0x8a9096);
            post(L, f.c + f.right * lr, f.c + f.right * lr + Vec3(0, 8.4f, 0), 0.16f, 0x8a9096);
            L.color(0x8a9096); L.box(Mat4::basis(f.right, Vec3(0, 1, 0), -f.fwd, f.c), Vec3(lm, 7.8f, -0.18f), Vec3(lr, 8.3f, 0.18f));
            float pc = f.W * 0.25f, pw = std::min(f.W * 0.9f, 10.5f);
            L.color(0x16181a); L.mat = MAT_LIT;
            L.box(Mat4::basis(f.right, Vec3(0, 1, 0), -f.fwd, f.c), Vec3(pc - pw / 2, 5.9f, 0.1f), Vec3(pc + pw / 2, 7.7f, 0.45f));
            Fr ft = f; ft.c = f.c - f.fwd * 0.46f;
            const char* m = msgs[(int)(s / 17300.f) % 6];
            float size = std::min(0.95f, pw * 0.9f / std::max(font->width(m, 1.f), 0.1f));
            textAt(T, *font, ft, m, pc, 6.5f, size, 0xffb020, MAT_EMIT);
        }
    }
}
