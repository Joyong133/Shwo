// Hand-built places along the route: the two terminals, the Seoul toll plaza, the Nopo exit toll and Chupungnyeong rest area.
#include "world.h"
#include "models.h"

void addBill(BillMeshData& m, const Vec3& p, float hw, float h0, float h1, float u0, float v0, float u1, float v1, uint32_t rgba);
void addGlow(BillMeshData& m, const Vec3& p, float size, int hex, int a);

namespace {
struct Fr {
    Vec3 c, fwd, right; Mat4 M;
    // local coordinates: x = lateral (right +), y = up, z = -along (so -z is "ahead")
    Vec3 P(float lat, float h, float along) const { return c + right * lat + Vec3(0, h, 0) + fwd * along; }
};
Fr frameAt(const Route& R, int i, const Vec3d& origin) {
    Fr f; int a = std::max(i - 1, 0), b = std::min(i + 1, R.N - 1);
    f.fwd = normalize(Vec3((float)(R.x[b] - R.x[a]), 0, (float)(R.z[b] - R.z[a]))); f.right = Vec3(-f.fwd.z, 0, f.fwd.x);
    f.c = Vec3((float)(R.x[i] - origin.x), R.y[i] - (float)origin.y, (float)(R.z[i] - origin.z));
    f.M = Mat4::basis(f.right, Vec3(0, 1, 0), -f.fwd, f.c);
    return f;
}
// box given in (lateral, height, along) ranges
void lbox(MeshData& m, const Fr& f, float l0, float l1, float h0, float h1, float a0, float a1, int colr, uint8_t mat = MAT_LIT, float layer = -1, int faces = 63) {
    m.mat = mat; m.layer = layer; m.color(colr);
    m.box(f.M, Vec3(l0, h0, -a1), Vec3(l1, h1, -a0), faces, layer >= 0 ? 0.25f : 1.f);
}
// sign text on a vertical plane; `facing` is the direction the text faces (unit, horizontal)
void sign(MeshData& T, const Font& font, const Vec3& center, const Vec3& facing, const char* s, float size, int colr, uint8_t mat = MAT_SIGN) {
    Vec3 right = normalize(cross(Vec3(0, 1, 0), facing));
    T.mat = mat; T.color(colr);
    font.draw(T, s, center + facing * 0.03f - Vec3(0, size * 0.36f, 0), right, Vec3(0, 1, 0), size, 1);
}
void plate(MeshData& L, const Vec3& center, const Vec3& facing, float w, float h, int colr, uint8_t mat = MAT_SIGN) {
    Vec3 right = normalize(cross(Vec3(0, 1, 0), facing)); Vec3 up(0, 1, 0);
    L.mat = mat; L.layer = -1; L.color(colr);
    L.quad(center - right * (w / 2) - up * (h / 2), center + right * (w / 2) - up * (h / 2), center + right * (w / 2) + up * (h / 2), center - right * (w / 2) + up * (h / 2));
}
void lamp(ChunkData& out, const Vec3& base, float h) {
    MeshData& L = out.lit; L.mat = MAT_LIT; L.layer = -1; L.color(0x858b90);
    L.cylinder(Mat4::identity(), base, base + Vec3(0, h, 0), 0.10f, 0.07f, 6, false);
    L.mat = MAT_NIGHTLAMP; L.color(0xfff0cf);
    L.box(Mat4::translate(base + Vec3(0, h, 0)), Vec3(-0.35f, 0, -0.35f), Vec3(0.35f, 0.16f, 0.35f));
    addGlow(out.glow, base + Vec3(0, h + 0.05f, 0), 1.6f, 0xffd9a0, 255);
}
const int kParkTints[] = {0xf2f2f0, 0xf2f2f0, 0x18181a, 0x8a8d90, 0xc4c6c8, 0x2a4f8c, 0x9c2a2a, 0xe9e9e6, 0x6f7377};

// A bus terminal: boarding island with a canopy on the right of the bay, the terminal hall behind it, other coaches alongside.
void terminal(ChunkData& out, const Font& font, const Fr& f, float a0, float a1, const char* name, const char* board, const char* sub, uint32_t seed) {
    MeshData& L = out.lit; MeshData& T = out.text;
    // boarding island and kerb
    lbox(L, f, 1.75f, 6.2f, 0, 0.18f, a0, a1, 0xa9a69c, MAT_LIT, -1, 63 & ~8);
    L.mat = MAT_LIT; L.color(0xd8c23a);
    L.quad(f.P(1.75f, 0.185f, a0), f.P(1.95f, 0.185f, a0), f.P(1.95f, 0.185f, a1), f.P(1.75f, 0.185f, a1));       // tactile yellow edge
    // canopy on slim columns
    lbox(L, f, 1.2f, 6.6f, 4.3f, 4.55f, a0 - 1, a1 + 1, 0xdfe3e6);
    lbox(L, f, 1.2f, 6.6f, 4.0f, 4.3f, a0 - 1, a1 + 1, 0x3c6a9a, MAT_LIT, -1, 1 | 2 | 16 | 32);
    for (float a = a0 + 2; a <= a1 - 1; a += 8) {
        L.mat = MAT_LIT; L.color(0x8a9096);
        L.cylinder(Mat4::identity(), f.P(5.6f, 0.18f, a), f.P(5.6f, 4.3f, a), 0.11f, 0.11f, 8, false);
        // strip light under the canopy
        L.mat = MAT_NIGHTLAMP; L.color(0xf4f6ff);
        L.quad(f.P(3.2f, 3.99f, a + 1), f.P(3.0f, 3.99f, a + 1), f.P(3.0f, 3.99f, a + 5), f.P(3.2f, 3.99f, a + 5));
        addGlow(out.glow, f.P(3.1f, 3.9f, a + 3), 1.2f, 0xe8eeff, 200);
    }
    // gate board hanging at the kerb, facing the bus
    for (float a = a0 + 6; a < a1; a += 16) {
        Vec3 c = f.P(3.6f, 3.35f, a);
        float bw = std::max(font.width(sub, 0.15f) + 0.3f, 1.8f);
        plate(L, c, -f.right, bw, 0.78f, 0x12305c); plate(L, c + f.right * 0.02f, f.right, bw, 0.78f, 0x12305c);
        sign(T, font, c + Vec3(0, 0.14f, 0), -f.right, board, 0.34f, 0xffffff, MAT_EMIT);
        sign(T, font, c - Vec3(0, 0.22f, 0), -f.right, sub, 0.15f, 0xffd27a, MAT_EMIT);
    }
    // benches
    for (float a = a0 + 4; a < a1 - 2; a += 6) {
        lbox(L, f, 4.4f, 4.9f, 0.18f, 0.62f, a, a + 2.2f, 0x4a6a8a);
        lbox(L, f, 4.85f, 4.93f, 0.62f, 1.05f, a, a + 2.2f, 0x4a6a8a);
    }
    // terminal hall behind the island: glazed ground floor, panelled upper storeys, big name sign
    float bl0 = 6.2f, bl1 = 40.f;
    L.mat = MAT_WINDOW; L.layer = 7; L.color(0xd9d4c8, 180);
    L.quad(f.P(bl0, 0.18f, a1 + 4), f.P(bl0, 0.18f, a0 - 6), f.P(bl0, 4.0f, a0 - 6), f.P(bl0, 4.0f, a1 + 4), 0, 0, (a1 - a0 + 10) / 4.f, 1);
    L.layer = 2; L.color(0xc9d2d8, 90);
    L.quad(f.P(bl0, 4.55f, a1 + 4), f.P(bl0, 4.55f, a0 - 6), f.P(bl0, 18.f, a0 - 6), f.P(bl0, 18.f, a1 + 4), 0, 0, (a1 - a0 + 10) / 3.6f, 4);
    lbox(L, f, bl0, bl1, 0, 18.f, a0 - 6, a1 + 4, 0xb9bcc0, MAT_LIT, -1, 4 | 16 | 32 | 1);
    Vec3 sc = f.P(bl0 - 0.05f, 6.6f, (a0 + a1) * 0.5f);
    plate(L, sc, -f.right, std::max(font.width(name, 1.5f) + 1.6f, 6.f), 2.3f, 0x143a6e, MAT_EMIT);
    sign(T, font, sc, -f.right, name, 1.5f, 0xffffff, MAT_EMIT);
    // neighbouring bays on the left with parked coaches
    static const int stripes[] = {0xf4f4f2, 0xe6ecf4, 0xf4efe2, 0xf2f2f0};
    for (int k = 1; k <= 4; k++) {
        float l = -4.6f * k;
        if (hashf(seed + k) < 0.8f) {
            float a = (a0 + a1) * 0.5f + (hashf(seed + k * 7) - 0.5f) * 6.f - 2.f;
            appendVehicle(L, VEH_BUS, f.M * Mat4::translate(Vec3(l, 0, -a)), stripes[k % 4]);
        }
        L.mat = MAT_LIT; L.layer = -1; L.color(0xdedcd4);
        L.quad(f.P(l + 2.25f, 0.012f, a0), f.P(l + 2.37f, 0.012f, a0), f.P(l + 2.37f, 0.012f, a1), f.P(l + 2.25f, 0.012f, a1));    // bay lines
    }
    L.mat = MAT_LIT; L.color(0xdedcd4);
    L.quad(f.P(-2.05f, 0.012f, a0), f.P(-1.93f, 0.012f, a0), f.P(-1.93f, 0.012f, a1), f.P(-2.05f, 0.012f, a1));
    // back wall of the yard and lamps
    lbox(L, f, -24.f, bl0, 0, 3.2f, a0 - 7.5f, a0 - 7.f, 0xb5b2a8);
    for (float a = a0; a <= a1 + 20; a += 22) lamp(out, f.P(-21.f, 0, a), 10.f);
}

void tollPlaza(ChunkData& out, const Font& font, const Fr& f, float W, float eL, float eR, const char* name) {
    MeshData& L = out.lit; MeshData& T = out.text;
    const float D = 15.f, H = 6.4f;
    // roof across both carriageways
    lbox(L, f, -eL - 1.5f, eR + 1.5f, H, H + 0.9f, -D / 2, D / 2, 0xe9ecef);
    lbox(L, f, -eL - 1.5f, eR + 1.5f, H + 0.9f, H + 1.15f, -D / 2 - 0.6f, D / 2 + 0.6f, 0x2d6fb4);
    // islands, booths and columns between the lanes of each direction
    auto row = [&](float l0, float l1, float pitch) {
        for (float l = l0; l <= l1 + 0.01f; l += pitch) {
            lbox(L, f, l - 0.32f, l + 0.32f, 0, 0.28f, -9.f, 9.f, 0xd8c23a, MAT_LIT, -1, 63 & ~8);
            lbox(L, f, l - 0.22f, l + 0.22f, 0.28f, H, -0.25f, 0.25f, 0x9aa0a6, MAT_LIT, -1, 1 | 2 | 16 | 32);
            lbox(L, f, l - 0.3f, l + 0.3f, 0.28f, 1.1f, -8.6f, -7.8f, 0xd8c23a);       // crash cushion
        }
    };
    float lanes = floorf(W / 3.6f + 0.5f);
    row(-W / 2, -W / 2 + lanes * 3.6f, 3.6f);
    for (float l = W / 2 + 3.9f; l < eR - 1.f; l += 3.9f) row(l, l, 99.f);
    float oEdge = -W / 2 - 3.2f;
    row(oEdge - lanes * 3.6f, oEdge, 3.6f);
    for (float l = oEdge - lanes * 3.6f - 3.9f; l > -eL + 1.f; l -= 3.9f) row(l, l, 99.f);
    // lane signs facing the oncoming traffic
    for (int k = 0; k < (int)lanes; k++) {
        float lc = -W / 2 + (k + 0.5f) * 3.6f; Vec3 c = f.P(lc, H - 0.55f, -D / 2 - 0.05f);
        plate(L, c, -f.fwd, 2.7f, 0.85f, 0x1b4f9c, MAT_EMIT);
        sign(T, font, c, -f.fwd, "하이패스", 0.5f, 0xffffff, MAT_EMIT);
    }
    Vec3 nc = f.P(W * 0.1f, H + 2.0f, -D / 2 - 0.62f);
    plate(L, nc, -f.fwd, std::max(font.width(name, 1.5f) + 1.5f, 7.f), 2.2f, 0x0c6b45, MAT_SIGN);
    sign(T, font, nc, -f.fwd, name, 1.5f, 0xffffff, MAT_SIGN);
    lbox(L, f, W * 0.1f - 0.15f, W * 0.1f + 0.15f, H + 0.9f, H + 1.0f, -D / 2 - 0.6f, -D / 2, 0x8a9096);
    for (float l = -eL; l <= eR; l += 12.f) addGlow(out.glow, f.P(l, H - 0.1f, 0), 1.6f, 0xfff0d0, 230);
}

void restArea(ChunkData& out, const Font& font, const Route& R, const WorldData& d, int i0, int i1, int lod) {
    MeshData& L = out.lit; MeshData& T = out.text;
    int iR = (int)(R.S_REST / R.step);
    auto fr = [&](float along) { return frameAt(R, std::min(std::max(iR + (int)lroundf(along / R.step), 1), R.N - 2), out.origin); };
    auto inChunk = [&](float along) { int i = iR + (int)lroundf(along / R.step); return i >= i0 && i < i1; };
    float W = R.W[iR], eR0 = W / 2 + 3.f;
    // planted island between the expressway and the rest area
    for (float a = 110; a < 680; a += 10) {
        if (!inChunk(a)) continue;
        Fr f = fr(a);
        lbox(L, f, eR0 + 2.f, eR0 + 11.f, 0, 0.22f, 0, 10.02f, 0x8a8f5c, MAT_LIT, -1, 63 & ~8);
        if (lod <= 1 && ((int)a % 20) == 10) {
            uint32_t h = hash32((uint32_t)a);
            Vec3 p = f.P(eR0 + 6.5f, 0.2f, 5); float hg = 8.f + 4.f * hashf(h);
            int sp = (h & 1) ? 0 : 3; float u0 = (sp % 4) * 0.25f, v0 = (sp / 4) * 0.5f;
            addBill(out.trees, p, hg * 0.4f, 0, hg, u0 + 0.004f, v0 + 0.004f, u0 + 0.246f, v0 + 0.496f, 0xdcdcdc00u | (sp == 0 ? 0u : 255u));
        }
    }
    if (lod > 1) return;
    // parked cars in two double rows, with painted bays
    for (float a = 172; a < 610; a += 2.7f) {
        if (!inChunk(a)) continue;
        Fr f = fr(a);
        for (int rowi = 0; rowi < 4; rowi++) {
            float lat = eR0 + (rowi < 2 ? 26.f + rowi * 5.4f : 43.f + (rowi - 2) * 5.4f);
            L.mat = MAT_LIT; L.layer = -1; L.color(0xd9d7cf);
            L.quad(f.P(lat - 2.5f, 0.015f, -0.06f), f.P(lat + 2.5f, 0.015f, -0.06f), f.P(lat + 2.5f, 0.015f, 0.06f), f.P(lat - 2.5f, 0.015f, 0.06f));
            uint32_t h = hash2((int)(a * 10), rowi + 77);
            if (hashf(h) < 0.46f) {
                float r = hashf(h + 1); int type = r < 0.55f ? VEH_SEDAN : (r < 0.85f ? VEH_SUV : VEH_VAN);
                float yaw = (rowi % 2) ? PI / 2 : -PI / 2;
                appendVehicle(L, type, f.M * Mat4::translate(Vec3(lat, 0, -1.35f)) * Mat4::rotY(yaw), kParkTints[hash32(h + 2) % 9]);
            }
        }
    }
    // coaches and trucks resting in the long bays beside ours
    for (int k = 0; k < 7; k++) {
        float a = 250.f + k * 44.f; if (!inChunk(a)) continue;
        Fr f = fr(a);
        if (k != 3) appendVehicle(L, (k % 3 == 1) ? VEH_BOXTRUCK : VEH_BUS, f.M * Mat4::translate(Vec3(eR0 + 56.4f, 0, 0)), k % 2 ? 0xf4f4f2 : 0xe6ecf4);
        L.mat = MAT_LIT; L.layer = -1; L.color(0xd9d7cf);
        L.quad(f.P(eR0 + 58.6f, 0.015f, -22), f.P(eR0 + 58.75f, 0.015f, -22), f.P(eR0 + 58.75f, 0.015f, 22), f.P(eR0 + 58.6f, 0.015f, 22));
    }
    // pavement in front of the hall
    for (float a = 230; a < 580; a += 10) {
        if (!inChunk(a)) continue;
        Fr f = fr(a);
        lbox(L, f, eR0 + 66.5f, eR0 + 76.f, 0, 0.16f, 0, 10.02f, 0xb9b5aa, MAT_LIT, -1, 63 & ~8);
        if (((int)a % 30) == 0) lamp(out, f.P(eR0 + 67.3f, 0.16f, 5), 6.5f);
        if (((int)a % 40) == 10) { lamp(out, f.P(eR0 + 40.2f, 0, 5), 11.f); lamp(out, f.P(eR0 + 22.f, 0, 5), 11.f); }
    }
    // the hall: one long building, built from the frame at its middle
    if (inChunk(400)) {
        Fr f = fr(400);
        float b0 = eR0 + 76.f, b1 = eR0 + 100.f, a0 = -75, a1 = 75;
        L.mat = MAT_WINDOW; L.layer = 7; L.color(0xe2ddd0, 200);
        L.quad(f.P(b0, 0.16f, a1), f.P(b0, 0.16f, a0), f.P(b0, 4.6f, a0), f.P(b0, 4.6f, a1), 0, 0, 37, 1);
        lbox(L, f, b0, b1, 4.6f, 9.5f, a0, a1, 0xd8d2c2, MAT_LIT, -1, 2 | 4 | 16 | 32);
        lbox(L, f, b0, b1, 0, 4.6f, a0, a1, 0xc9c4b6, MAT_LIT, -1, 1 | 16 | 32);
        lbox(L, f, b0 - 4.5f, b0, 4.3f, 4.6f, a0 - 2, a1 + 2, 0x7a3b2c);                       // awning
        for (float a = a0 + 3; a < a1; a += 12) { L.mat = MAT_LIT; L.color(0x8a9096); L.cylinder(Mat4::identity(), f.P(b0 - 4.2f, 0.16f, a), f.P(b0 - 4.2f, 4.3f, a), 0.1f, 0.1f, 6, false); }
        // roof sign
        Vec3 sc = f.P(b0 - 0.1f, 7.2f, 0);
        plate(L, sc, -f.right, 26.f, 3.4f, 0x7a3b2c, MAT_EMIT);
        sign(T, font, sc, -f.right, "추풍령휴게소", 2.5f, 0xffffff, MAT_EMIT);
        sign(T, font, f.P(b0 - 0.1f, 5.2f, 0), -f.right, "경부고속도로 중간 지점 · 부산 방향", 0.55f, 0x3a2a1c, MAT_SIGN);
        // shop fascias under the awning
        static const char* shops[] = {"화장실", "편의점", "식당가", "호두과자", "커피", "우동 · 라면", "특산물", "화장실"};
        static const int scol[] = {0x1b4f9c, 0x2f8a4a, 0xb8442c, 0x7a4a1c, 0x3a2a22, 0xc2622d, 0x4d7a57, 0x1b4f9c};
        for (int k = 0; k < 8; k++) {
            float a = a0 + 10 + k * 18.5f; Vec3 c = f.P(b0 - 0.06f, 3.75f, a);
            plate(L, c, -f.right, 8.f, 0.95f, scol[k], MAT_EMIT);
            sign(T, font, c, -f.right, shops[k], 0.6f, 0xffffff, MAT_EMIT);
            addGlow(out.glow, f.P(b0 - 2.f, 4.1f, a), 1.4f, 0xfff0d8, 200);
        }
        // a few people-sized planters and benches along the pavement give scale
        for (float a = a0 + 6; a < a1; a += 9) {
            lbox(L, f, b0 - 8.2f, b0 - 7.4f, 0.16f, 0.7f, a, a + 1.6f, 0x6a5a48);
            Vec3 p = f.P(b0 - 7.8f, 0.7f, a + 0.8f);
            addBill(out.trees, p, 0.7f, 0, 1.6f, 0.254f, 0.504f, 0.496f, 0.996f, 0xd0d0d0ffu);
        }
    }
    // filling station under a canopy towards the exit
    if (inChunk(640)) {
        Fr f = fr(640);
        float l0 = eR0 + 26.f, l1 = eR0 + 52.f;
        lbox(L, f, l0, l1, 5.6f, 6.3f, -9, 9, 0xf0f0ee);
        lbox(L, f, l0 - 0.05f, l1 + 0.05f, 5.5f, 6.0f, -9.05f, 9.05f, 0xd23a2a, MAT_LIT, -1, 1 | 2 | 16 | 32);
        for (float l = l0 + 4; l < l1; l += 9) for (int e = -1; e <= 1; e += 2) {
            L.mat = MAT_LIT; L.color(0xd9d9d6); L.cylinder(Mat4::identity(), f.P(l, 0, e * 5.f), f.P(l, 5.6f, e * 5.f), 0.22f, 0.22f, 8, false);
            lbox(L, f, l - 0.45f, l + 0.45f, 0.15f, 1.7f, e * 5.f + 1.2f, e * 5.f + 2.2f, 0xe8e8e4);
            lbox(L, f, l - 1.3f, l + 1.3f, 0, 0.15f, e * 5.f - 1.f, e * 5.f + 3.f, 0x9a978f, MAT_LIT, -1, 63 & ~8);
            addGlow(out.glow, f.P(l, 5.4f, e * 5.f), 1.5f, 0xf4f8ff, 230);
        }
        Vec3 c = f.P((l0 + l1) / 2, 5.75f, -9.1f);
        sign(T, font, c, -f.fwd, "주유소 · 충전소", 0.42f, 0xffffff, MAT_EMIT);
    }
    (void)d;
}
}  // namespace

void World::genSetPieces(int i0, int i1, int lod, ChunkData& out) {
    const Route& R = d.route;
    if (!font) return;
    float extra = 0;
    // ---- terminals
    if (lod <= 1) {
        if (2 >= i0 && 2 < i1) { Fr f = frameAt(R, 3, out.origin); terminal(out, *font, f, -14.f, 40.f, "서울고속버스터미널", "부산", "경부선 15번 승차홈 · 우등", 11); extra = 70; }
        int ie = R.N - 3;
        if (ie >= i0 && ie <= i1) { Fr f = frameAt(R, ie - 1, out.origin); terminal(out, *font, f, -46.f, 8.f, "부산종합버스터미널", "하차장", "부산 · 노포동", 23); extra = 70; }
    }
    // ---- Seoul toll plaza and the Nopo exit toll
    int iT = (int)(R.S_TG / R.step);
    if (iT >= i0 && iT < i1) { Fr f = frameAt(R, iT, out.origin); tollPlaza(out, *font, f, R.W[iT], R.extL[iT], R.extR[iT], "서울요금소"); extra = 40; }
    int iE = (int)(R.S_EXITTOLL / R.step);
    if (iE >= i0 && iE < i1 && lod <= 1) {
        Fr f = frameAt(R, iE, out.origin); MeshData& L = out.lit;
        lbox(L, f, -7.f, 7.f, 5.6f, 6.2f, -5, 5, 0xe9ecef);
        lbox(L, f, -7.f, 7.f, 6.2f, 6.4f, -5.4f, 5.4f, 0x2d6fb4);
        for (int sd = -1; sd <= 1; sd += 2) {
            lbox(L, f, sd * 5.0f - 0.3f, sd * 5.0f + 0.3f, 0, 0.28f, -7, 7, 0xd8c23a, MAT_LIT, -1, 63 & ~8);
            lbox(L, f, sd * 5.0f - 0.2f, sd * 5.0f + 0.2f, 0.28f, 5.6f, -0.2f, 0.2f, 0x9aa0a6, MAT_LIT, -1, 1 | 2 | 16 | 32);
        }
        Vec3 c = f.P(0, 5.0f, -5.05f); plate(L, c, -f.fwd, 4.6f, 0.9f, 0x1b4f9c, MAT_EMIT); sign(out.text, *font, c, -f.fwd, "하이패스 · 노포", 0.5f, 0xffffff, MAT_EMIT);
        addGlow(out.glow, f.P(0, 5.4f, 0), 1.6f, 0xfff0d0, 230);
    }
    // ---- rest area
    int iR = (int)(R.S_REST / R.step);
    if (i1 > iR && i0 < iR + (int)(820 / R.step)) { restArea(out, *font, R, d, i0, i1, lod); extra = std::max(extra, 140.f); }
    // ---- stop lines at the signals, street trees in town
    if (lod <= 1) {
        for (const Stop& st : R.stops) {
            if (st.type != 0) continue;
            int i = (int)((st.s + 7.5f) / R.step); if (i < i0 || i >= i1) continue;
            Fr f = frameAt(R, i, out.origin); MeshData& L = out.lit; L.mat = MAT_LIT; L.layer = -1; L.color(0xdedcd4);
            float w = R.lanes[i] * 3.3f;
            L.quad(f.P(0.2f, 0.02f, -0.3f), f.P(w, 0.02f, -0.3f), f.P(w, 0.02f, 0.3f), f.P(0.2f, 0.02f, 0.3f));
            for (float l = -w + 0.6f; l < w; l += 1.3f) L.quad(f.P(l, 0.02f, 2.f), f.P(l + 0.6f, 0.02f, 2.f), f.P(l + 0.6f, 0.02f, 6.f), f.P(l, 0.02f, 6.f));    // zebra crossing
        }
        for (int i = i0; i < i1; i++) {
            if (R.kind[i] != RK_CITY || (i % 3) != 0) continue;
            Fr f = frameAt(R, i, out.origin);
            for (int sd = -1; sd <= 1; sd += 2) {
                uint32_t h = hash2(i, sd + 5); float hg = 8.5f + 3.5f * hashf(h);
                Vec3 p = f.P(sd * (R.lanes[i] * 3.3f + 1.9f), 0.16f, 0);
                int sv = (int)(190 + 60 * hashf(h + 1));
                addBill(out.trees, p, hg * 0.3f, 0, hg, 0.754f, 0.504f, 0.996f, 0.996f, ((uint32_t)sv << 24) | ((uint32_t)sv << 16) | ((uint32_t)sv << 8) | 128u);
            }
        }
    }
    out.radius += extra;
}
