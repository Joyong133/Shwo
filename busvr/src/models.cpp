// Low-poly vehicles shared by the traffic system and the parked set-piece cars.
#include "models.h"

namespace {
const int GLASS = 0x1c2329, TYRE = 0x141414, HUB = 0x8d9195, TRIM = 0x26282b;

void wheels(MeshData& m, float halfTrack, float zFront, float zRear, float r, float w, bool dual = false) {
    for (int ax = 0; ax < 2; ax++) for (int sd = -1; sd <= 1; sd += 2) {
        float z = ax ? zRear : zFront; float x0 = sd * (halfTrack - w * 0.5f), x1 = sd * (halfTrack + w * 0.5f);
        float ww = (dual && ax) ? w * 1.9f : w; if (dual && ax) x0 = sd * (halfTrack - ww + w * 0.5f);
        m.mat = MAT_LIT; m.layer = -1; m.color(TYRE);
        m.cylinder(Mat4::identity(), Vec3(std::min(x0, x1), r, z), Vec3(std::max(x0, x1), r, z), r, r, 12, false);
        // outer face with a lighter hub
        Vec3 c(x1, r, z), n((float)sd, 0, 0);
        uint32_t i0 = m.vert(c, n);
        for (int k = 0; k <= 12; k++) { float a = (float)k / 12 * 2 * PI; m.vert(c + Vec3(0, cosf(a) * r, sinf(a) * r), n); }
        for (int k = 0; k < 12; k++) { if (sd > 0) m.tri(i0, i0 + 1 + k, i0 + 2 + k); else m.tri(i0, i0 + 2 + k, i0 + 1 + k); }
        m.color(HUB);
        Vec3 c2 = c + n * 0.004f; i0 = m.vert(c2, n);
        for (int k = 0; k <= 10; k++) { float a = (float)k / 10 * 2 * PI; m.vert(c2 + Vec3(0, cosf(a) * r * 0.55f, sinf(a) * r * 0.55f), n); }
        for (int k = 0; k < 10; k++) { if (sd > 0) m.tri(i0, i0 + 1 + k, i0 + 2 + k); else m.tri(i0, i0 + 2 + k, i0 + 1 + k); }
    }
}
// tapered glasshouse: bottom rectangle (hw0, z0a..z0b) at y0, top rectangle (hw1, z1a..z1b) at y1; glass sides, painted roof
void cabin(MeshData& m, float y0, float y1, float hw0, float z0a, float z0b, float hw1, float z1a, float z1b) {
    Vec3 b[4] = {{-hw0, y0, z0a}, {hw0, y0, z0a}, {hw0, y0, z0b}, {-hw0, y0, z0b}}, t[4] = {{-hw1, y1, z1a}, {hw1, y1, z1a}, {hw1, y1, z1b}, {-hw1, y1, z1b}};
    m.mat = MAT_PAINT; m.layer = -1; m.color(GLASS);
    m.quad(b[1], b[0], t[0], t[1]);      // windscreen (front, -z)
    m.quad(b[3], b[2], t[2], t[3]);      // rear screen
    m.quad(b[2], b[1], t[1], t[2]);      // right
    m.quad(b[0], b[3], t[3], t[0]);      // left
    m.color(0xffffff);
    m.quad(t[0], t[3], t[2], t[1]);      // roof (body colour)
}
void lamps(MeshData& m, float hw, float y, float zf, float zr, float size = 0.16f) {
    m.mat = MAT_NIGHTLAMP; m.layer = -1;
    for (int sd = -1; sd <= 1; sd += 2) {
        float x = sd * (hw - 0.22f);
        m.color(0xf4f2e4);
        m.quad(Vec3(x + size, y - size * 0.5f, zf), Vec3(x - size, y - size * 0.5f, zf), Vec3(x - size, y + size * 0.5f, zf), Vec3(x + size, y + size * 0.5f, zf));
        m.color(0xc01a1a);
        m.quad(Vec3(x - size, y - size * 0.5f, zr), Vec3(x + size, y - size * 0.5f, zr), Vec3(x + size, y + size * 0.5f, zr), Vec3(x - size, y + size * 0.5f, zr));
    }
}
void paint(MeshData& m) { m.mat = MAT_PAINT; m.layer = -1; m.color(0xffffff); }
}  // namespace

void buildVehicle(int type, MeshData& m, VehicleInfo& info) {
    m.clear();
    switch (type) {
        case VEH_SEDAN: {
            info = {4.75f, 1.84f, 1.45f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-0.92f, 0.26f, -2.37f), Vec3(0.92f, 0.86f, 2.37f), 0.14f, 2);
            cabin(m, 0.84f, 1.44f, 0.84f, -0.95f, 1.70f, 0.70f, -0.25f, 1.10f);
            wheels(m, 0.84f, -1.45f, 1.42f, 0.33f, 0.22f); lamps(m, 0.92f, 0.66f, -2.375f, 2.375f);
            break;
        }
        case VEH_SUV: {
            info = {4.7f, 1.9f, 1.72f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-0.95f, 0.32f, -2.35f), Vec3(0.95f, 1.02f, 2.35f), 0.13f, 2);
            cabin(m, 1.00f, 1.71f, 0.88f, -1.05f, 2.25f, 0.78f, -0.45f, 2.05f);
            wheels(m, 0.87f, -1.42f, 1.40f, 0.37f, 0.25f); lamps(m, 0.95f, 0.82f, -2.355f, 2.355f);
            break;
        }
        case VEH_VAN: {
            info = {5.15f, 1.98f, 1.92f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-0.99f, 0.30f, -2.57f), Vec3(0.99f, 1.10f, 2.57f), 0.13f, 2);
            cabin(m, 1.08f, 1.91f, 0.93f, -1.85f, 2.50f, 0.84f, -1.15f, 2.40f);
            wheels(m, 0.90f, -1.65f, 1.55f, 0.35f, 0.24f); lamps(m, 0.99f, 0.84f, -2.575f, 2.575f);
            break;
        }
        case VEH_PORTER: {      // 1-tonne cab-over pickup: the workhorse of Korean roads
            info = {5.1f, 1.74f, 2.0f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-0.87f, 0.42f, -2.55f), Vec3(0.87f, 1.25f, -1.05f), 0.10f, 2);
            cabin(m, 1.23f, 1.98f, 0.84f, -2.50f, -1.08f, 0.78f, -2.20f, -1.10f);
            m.mat = MAT_LIT; m.color(0x55585c);
            m.box(Mat4::identity(), Vec3(-0.85f, 0.78f, -1.0f), Vec3(0.85f, 0.86f, 2.55f));
            m.color(0x3a4a3c); m.roundBox(Mat4::identity(), Vec3(-0.80f, 0.86f, -0.95f), Vec3(0.80f, 1.55f, 2.45f), 0.12f, 1);      // tarped load
            m.color(TRIM); m.box(Mat4::identity(), Vec3(-0.5f, 0.38f, -1.0f), Vec3(0.5f, 0.78f, 2.4f), 1 | 2 | 8 | 16 | 32);
            wheels(m, 0.78f, -1.95f, 1.45f, 0.31f, 0.20f, true); lamps(m, 0.87f, 0.80f, -2.555f, 2.555f, 0.12f);
            break;
        }
        case VEH_BOXTRUCK: {
            info = {8.6f, 2.45f, 3.5f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-1.15f, 0.55f, -4.3f), Vec3(1.15f, 2.05f, -2.5f), 0.12f, 2);
            cabin(m, 2.03f, 2.85f, 1.12f, -4.25f, -2.55f, 1.05f, -4.0f, -2.6f);
            m.mat = MAT_LIT; m.color(0xe6e6e2); m.box(Mat4::identity(), Vec3(-1.22f, 1.05f, -2.35f), Vec3(1.22f, 3.5f, 4.3f));
            m.color(TRIM); m.box(Mat4::identity(), Vec3(-0.55f, 0.5f, -2.4f), Vec3(0.55f, 1.05f, 4.1f), 1 | 2 | 8 | 16 | 32);
            wheels(m, 1.02f, -3.35f, 2.6f, 0.50f, 0.30f, true); lamps(m, 1.15f, 0.95f, -4.305f, 4.305f, 0.15f);
            break;
        }
        case VEH_TRAILER: {
            info = {16.2f, 2.5f, 3.9f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-1.2f, 0.6f, -8.1f), Vec3(1.2f, 2.3f, -6.1f), 0.12f, 2);
            cabin(m, 2.28f, 3.3f, 1.17f, -8.05f, -6.15f, 1.1f, -7.8f, -6.2f);
            m.mat = MAT_PAINT; m.color(0xffffff); m.box(Mat4::identity(), Vec3(-1.22f, 1.35f, -5.6f), Vec3(1.22f, 3.9f, 8.1f));
            m.mat = MAT_LIT; m.color(TRIM); m.box(Mat4::identity(), Vec3(-0.6f, 0.6f, -6.0f), Vec3(0.6f, 1.35f, 7.8f), 1 | 2 | 8 | 16 | 32);
            wheels(m, 1.04f, -7.0f, -3.9f, 0.52f, 0.30f, true); wheels(m, 1.04f, 5.6f, 6.9f, 0.52f, 0.30f, true); lamps(m, 1.2f, 1.0f, -8.105f, 8.105f, 0.15f);
            break;
        }
        default: {              // VEH_BUS: express coach
            info = {12.0f, 2.5f, 3.5f};
            paint(m); m.roundBox(Mat4::identity(), Vec3(-1.25f, 0.38f, -6.0f), Vec3(1.25f, 3.45f, 6.0f), 0.22f, 2);
            m.mat = MAT_PAINT; m.color(GLASS);
            for (int sd = -1; sd <= 1; sd += 2) {     // window band
                float x = sd * 1.256f;
                Vec3 a(x, 2.05f, -5.3f), b(x, 2.05f, 5.6f), c(x, 2.95f, 5.6f), d(x, 2.95f, -5.3f);
                if (sd > 0) m.quad(b, a, d, c); else m.quad(a, b, c, d);
            }
            m.quad(Vec3(1.1f, 1.75f, -6.006f), Vec3(-1.1f, 1.75f, -6.006f), Vec3(-1.1f, 3.05f, -6.006f), Vec3(1.1f, 3.05f, -6.006f));     // windscreen
            m.quad(Vec3(-1.0f, 2.2f, 6.006f), Vec3(1.0f, 2.2f, 6.006f), Vec3(1.0f, 2.9f, 6.006f), Vec3(-1.0f, 2.9f, 6.006f));
            m.mat = MAT_LIT; m.color(0xb8242c);     // livery stripe
            for (int sd = -1; sd <= 1; sd += 2) {
                float x = sd * 1.257f;
                Vec3 a(x, 1.25f, -5.9f), b(x, 1.25f, 5.9f), c(x, 1.62f, 5.9f), d(x, 1.62f, -5.9f);
                if (sd > 0) m.quad(b, a, d, c); else m.quad(a, b, c, d);
            }
            wheels(m, 1.05f, -4.1f, 3.2f, 0.52f, 0.30f, true); lamps(m, 1.25f, 0.85f, -6.006f, 6.006f, 0.17f);
            break;
        }
    }
}

void appendVehicle(MeshData& out, int type, const Mat4& M, int tintHex) {
    MeshData m; VehicleInfo info; buildVehicle(type, m, info);
    Vec3 t = rgb(tintHex);
    for (Vtx& v : m.v) if (v.mat == MAT_PAINT) { v.r = (uint8_t)(v.r * t.x); v.g = (uint8_t)(v.g * t.y); v.b = (uint8_t)(v.b * t.z); }
    out.append(m, M);
}
