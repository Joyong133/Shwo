#include "bus.h"

namespace {
enum Tex { T_SEAT = 0, T_COVER = 1, T_PLASTIC = 2, T_FLOOR = 3, T_CURTAIN = 4, T_TRIM = 5, T_METAL = 6, T_GRILLE = 7 };
const float UV = 4.f;      // interior textures repeat every 25 cm
struct P2 { float x, y; };

void sweepZ(MeshData& m, const P2* p, int n, float z0, float z1, const int* cols, const int* layers) {
    float u = 0;
    for (int k = 0; k + 1 < n; k++) {
        float len = hypotf(p[k + 1].x - p[k].x, p[k + 1].y - p[k].y);
        m.color(cols[k]); m.layer = (float)layers[k];
        Vec3 a(p[k].x, p[k].y, z1), b(p[k + 1].x, p[k + 1].y, z1), c(p[k + 1].x, p[k + 1].y, z0), d(p[k].x, p[k].y, z0);
        m.quad(a, b, c, d, u * UV, z1 * UV, (u + len) * UV, z0 * UV);
        u += len;
    }
}
void setm(MeshData& m, int colr, int layer) { m.mat = MAT_CABIN; m.color(colr); m.layer = (float)layer; }

void torus(MeshData& m, const Mat4& M, float R, float r, int seg, int ring) {
    uint32_t base = (uint32_t)m.v.size();
    for (int i = 0; i <= seg; i++) {
        float a = (float)i / seg * 2 * PI; Vec3 c(cosf(a) * R, 0, sinf(a) * R), out(cosf(a), 0, sinf(a));
        for (int j = 0; j <= ring; j++) { float b = (float)j / ring * 2 * PI; Vec3 n = out * cosf(b) + Vec3(0, 1, 0) * sinf(b); m.vert(M.point(c + n * r), M.dir(n)); }
    }
    for (int i = 0; i < seg; i++) for (int j = 0; j < ring; j++) {
        uint32_t a = base + i * (ring + 1) + j, b = a + ring + 1;
        m.tri(a, a + 1, b + 1); m.tri(a, b + 1, b);
    }
}

// One reclining seat. Origin: floor under the seat centre; +z is towards the rear of the bus.
void addSeat(MeshData& m, float cx, float cz, float fy, int fabric, bool legrest, float recline = 17.f) {
    Mat4 S = Mat4::translate(Vec3(cx, fy, cz));
    setm(m, 0x26282c, T_PLASTIC);
    m.box(S, Vec3(-0.20f, 0.02f, -0.18f), Vec3(0.20f, 0.31f, 0.20f), 63 & ~4 & ~8, UV);                 // pedestal
    setm(m, fabric, T_SEAT);
    m.roundBox(S * Mat4::translate(Vec3(0, 0.30f, 0)) * Mat4::rotX(radf(-4)), Vec3(-0.255f, 0, -0.27f), Vec3(0.255f, 0.165f, 0.24f), 0.05f, 2, UV);   // cushion
    Mat4 B = S * Mat4::translate(Vec3(0, 0.40f, 0.215f)) * Mat4::rotX(radf(recline));
    m.roundBox(B, Vec3(-0.25f, 0, -0.07f), Vec3(0.25f, 0.70f, 0.065f), 0.045f, 2, UV);                // backrest
    // side bolsters give the back some shape
    m.roundBox(B, Vec3(-0.265f, 0.06f, -0.105f), Vec3(-0.185f, 0.56f, 0.0f), 0.035f, 1, UV);
    m.roundBox(B, Vec3(0.185f, 0.06f, -0.105f), Vec3(0.265f, 0.56f, 0.0f), 0.035f, 1, UV);
    m.roundBox(B, Vec3(-0.17f, 0.64f, -0.10f), Vec3(0.17f, 0.90f, 0.05f), 0.05f, 2, UV);                // headrest
    setm(m, 0xece9df, T_COVER);
    m.roundBox(B, Vec3(-0.178f, 0.70f, -0.108f), Vec3(0.178f, 0.908f, 0.058f), 0.05f, 2, UV);           // white headrest cover
    setm(m, 0x303338, T_PLASTIC);
    m.box(B, Vec3(-0.245f, 0.03f, 0.060f), Vec3(0.245f, 0.69f, 0.085f), 63 & ~32, UV);                  // hard shell behind
    setm(m, 0x1d1f22, T_GRILLE);
    m.box(B, Vec3(-0.20f, 0.07f, 0.085f), Vec3(0.20f, 0.30f, 0.098f), 63 & ~32, UV * 2);                // net pocket
    setm(m, 0x3b3e44, T_PLASTIC);
    m.roundBox(B, Vec3(-0.11f, 0.585f, 0.085f), Vec3(0.11f, 0.625f, 0.118f), 0.012f, 1, UV);            // grab handle
    for (int sd = -1; sd <= 1; sd += 2) {                                                               // armrests
        float x0 = sd * 0.262f, x1 = sd * 0.318f;
        setm(m, 0x2c2f34, T_PLASTIC);
        m.roundBox(S, Vec3(std::min(x0, x1), 0.585f, -0.16f), Vec3(std::max(x0, x1), 0.64f, 0.27f), 0.018f, 1, UV);
        m.box(S, Vec3(std::min(x0, x1) + 0.012f, 0.36f, 0.06f), Vec3(std::max(x0, x1) - 0.012f, 0.59f, 0.26f), 1 | 2 | 16 | 32, UV);
    }
    if (legrest) {
        setm(m, fabric, T_SEAT);
        m.roundBox(S * Mat4::translate(Vec3(0, 0.40f, -0.275f)) * Mat4::rotX(radf(-12)), Vec3(-0.22f, -0.30f, -0.05f), Vec3(0.22f, 0.0f, 0.0f), 0.022f, 1, UV);
    }
}
}  // namespace

Vec3 BusModel::eye(int si) const {
    if (si < 0 || si >= (int)seats.size()) si = 0;
    return Vec3(seats[si].x, kFloor + 1.23f, seats[si].z + 0.17f);
}

void BusModel::build() {
    MeshData m, g;
    const float F = kFloor, HW = kHalfW, A = F - 0.14f;        // A = aisle level
    const float zP0 = -4.55f;                                   // start of the passenger saloon
    const int WALL = 0xbdb9ae, TRIMC = 0xcfccc3, CEIL = 0xd9d6cd, VINYL = 0x5a5d61, PLAT = 0x4a4c50;

    // ---- constant cross-section of the saloon: floor, low walls, racks, ceiling
    {
        const P2 lower[] = {{-HW - 0.08f, kSill}, {-HW, kSill}, {-HW, F}, {-0.10f, F}, {-0.10f, A}, {0.50f, A}, {0.50f, F}, {HW, F}, {HW, kSill}, {HW + 0.08f, kSill}};
        const int lc[] = {TRIMC, WALL, PLAT, 0x3a3c40, VINYL, 0x3a3c40, PLAT, WALL, TRIMC};
        const int ll[] = {T_PLASTIC, T_TRIM, T_FLOOR, T_METAL, T_FLOOR, T_METAL, T_FLOOR, T_TRIM, T_PLASTIC};
        m.mat = MAT_CABIN; sweepZ(m, lower, 10, zP0, kRear, lc, ll);
        const float rk = HW - 0.47f;
        const P2 upper[] = {{HW + 0.08f, kWinTop}, {HW, kWinTop}, {HW, kWinTop + 0.03f}, {rk, kWinTop + 0.03f}, {rk, kWinTop + 0.23f}, {0.52f, kCeil}, {-0.52f, kCeil},
                            {-rk, kWinTop + 0.23f}, {-rk, kWinTop + 0.03f}, {-HW, kWinTop + 0.03f}, {-HW, kWinTop}, {-HW - 0.08f, kWinTop}};
        const int uc[] = {TRIMC, TRIMC, 0xb5b2a8, 0xc9c6bc, CEIL, 0xe2dfd6, CEIL, 0xc9c6bc, 0xb5b2a8, TRIMC, TRIMC};
        const int ul[] = {T_PLASTIC, T_PLASTIC, T_PLASTIC, T_PLASTIC, T_TRIM, T_TRIM, T_TRIM, T_PLASTIC, T_PLASTIC, T_PLASTIC, T_PLASTIC};
        sweepZ(m, upper, 12, kFront, kRear, uc, ul);
        // light strips along the ceiling edges and the blue floor line of a night coach
        m.mat = MAT_NIGHTLAMP; m.layer = -1; m.color(0x5f79c8);
        for (int sd = -1; sd <= 1; sd += 2) {
            float x = sd > 0 ? 0.50f : -0.10f; float x2 = x - sd * 0.012f;
            m.quad(Vec3(x2, A + 0.012f, kRear - 0.4f), Vec3(x2 + sd * 0.0f, A + 0.035f, kRear - 0.4f), Vec3(x2, A + 0.035f, zP0), Vec3(x2, A + 0.012f, zP0));
            m.quad(Vec3(x2, A + 0.012f, zP0), Vec3(x2, A + 0.035f, zP0), Vec3(x2, A + 0.035f, kRear - 0.4f), Vec3(x2, A + 0.012f, kRear - 0.4f));
        }
        m.mat = MAT_CABIN;
    }
    // ---- window pillars, curtains, service units
    const int NB = 6; const float bay = 1.70f, zW0 = -4.50f;
    for (int sd = -1; sd <= 1; sd += 2) {
        for (int k = 0; k <= NB; k++) {
            float zc = zW0 + k * bay, hw = (k == 0 || k == NB) ? 0.10f : 0.065f;
            float xi = sd * HW, xo = sd * (HW + 0.08f);
            setm(m, TRIMC, T_PLASTIC);
            Vec3 a(xi, kSill, zc - hw), b(xi, kSill, zc + hw), c(xi, kWinTop, zc + hw), d(xi, kWinTop, zc - hw);
            if (sd > 0) m.quad(a, b, c, d); else m.quad(b, a, d, c);
            // reveals
            Vec3 e(xo, kSill, zc - hw), f(xo, kWinTop, zc - hw), g2(xo, kSill, zc + hw), h(xo, kWinTop, zc + hw);
            if (sd > 0) { m.quad(e, a, d, f); m.quad(b, g2, h, c); } else { m.quad(a, e, f, d); m.quad(g2, b, c, h); }
            // gathered curtain against the pillar
            if (k > 0 && k < NB + 1) {
                setm(m, 0x74849f, T_CURTAIN);
                float xc = sd * (HW - 0.035f);
                m.roundBox(Mat4::translate(Vec3(xc, 0, zc)), Vec3(-0.03f, kSill + 0.02f, -0.11f), Vec3(0.03f, kWinTop - 0.01f, 0.11f), 0.028f, 1, UV);
                setm(m, 0x5c6a82, T_CURTAIN);
                m.roundBox(Mat4::translate(Vec3(xc, 0, zc)), Vec3(-0.036f, kSill + 0.36f, -0.075f), Vec3(0.036f, kSill + 0.40f, 0.075f), 0.012f, 1, UV);   // tie-back
            }
        }
        // rear quarter (no window)
        setm(m, TRIMC, T_PLASTIC);
        float z0 = zW0 + NB * bay, xi = sd * HW;
        Vec3 a(xi, kSill, z0), b(xi, kSill, kRear), c(xi, kWinTop, kRear), d(xi, kWinTop, z0);
        if (sd > 0) m.quad(a, b, c, d); else m.quad(b, a, d, c);
        // glass
        g.mat = MAT_CABIN; g.layer = -1; g.color(0x86a3a8, 26);
        float xg = sd * (HW + 0.075f);
        Vec3 ga(xg, kSill, zW0), gb(xg, kSill, z0), gc(xg, kWinTop, z0), gd(xg, kWinTop, zW0);
        if (sd > 0) g.quad(ga, gb, gc, gd); else g.quad(gb, ga, gd, gc);
    }
    // ---- rear wall
    setm(m, WALL, T_TRIM);
    m.quad(Vec3(HW, A, kRear), Vec3(-HW, A, kRear), Vec3(-HW, kCeil, kRear), Vec3(HW, kCeil, kRear), 0, 0, 2 * HW * UV, 2 * UV);

    // ---- seats: 8 rows of 2+1 and a rear row of four
    const int FAB = 0x3f4a66;
    seats.clear();
    for (int r = 0; r < 8; r++) {
        float z = -3.72f + r * 1.085f;
        const float xs[3] = {-0.885f, -0.365f, 0.80f};
        for (int c = 0; c < 3; c++) {
            addSeat(m, xs[c], z, F, FAB, true);
            seats.push_back(SeatPos{xs[c], z, r * 3 + c + 1, c != 1, ""});
        }
    }
    for (int c = 0; c < 4; c++) {
        float x = -0.86f + c * 0.573f;
        addSeat(m, x, 5.10f, c == 1 || c == 2 ? A : F, FAB, false, 12.f);
        seats.push_back(SeatPos{x, 5.10f, 25 + c, c == 0 || c == 3, ""});
    }
    choices = {2, 11, 9, 0, 23};
    // ---- overhead service units (reading lamp + vent) above every row
    for (int r = 0; r < 8; r++) {
        float z = -3.72f + r * 1.085f + 0.05f;
        for (int sd = -1; sd <= 1; sd += 2) {
            float xc = sd * (HW - 0.25f);
            setm(m, 0xaaa79e, T_PLASTIC);
            m.box(Mat4::translate(Vec3(xc, kWinTop + 0.012f, z)), Vec3(-0.17f, 0, -0.08f), Vec3(0.17f, 0.02f, 0.08f), 63 & ~4, UV);
            setm(m, 0x2a2c2e, T_GRILLE);
            m.quad(Vec3(xc - 0.15f, kWinTop + 0.011f, z - 0.05f), Vec3(xc - 0.03f, kWinTop + 0.011f, z - 0.05f), Vec3(xc - 0.03f, kWinTop + 0.011f, z + 0.05f), Vec3(xc - 0.15f, kWinTop + 0.011f, z + 0.05f), 0, 0, 2, 2);
            m.mat = MAT_NIGHTLAMP; m.layer = -1; m.color(0x8a93b8);
            m.quad(Vec3(xc + 0.04f, kWinTop + 0.011f, z - 0.03f), Vec3(xc + 0.10f, kWinTop + 0.011f, z - 0.03f), Vec3(xc + 0.10f, kWinTop + 0.011f, z + 0.03f), Vec3(xc + 0.04f, kWinTop + 0.011f, z + 0.03f));
            m.mat = MAT_CABIN;
        }
    }

    // ---- front: driver's platform, steps, dashboard, windscreen surround
    const float DF = 1.02f;                                    // driver's floor
    setm(m, VINYL, T_FLOOR);
    m.quad(Vec3(-HW, DF, zP0), Vec3(0.42f, DF, zP0), Vec3(0.42f, DF, kFront), Vec3(-HW, DF, kFront), 0, 0, 1.6f * UV, 1.4f * UV);
    m.quad(Vec3(-HW, DF, zP0), Vec3(-HW, A, zP0), Vec3(-0.10f, A, zP0), Vec3(-0.10f, DF, zP0));                    // riser up to the aisle (left of aisle it is hidden by the partition)
    m.quad(Vec3(0.42f, A, zP0), Vec3(HW, A, zP0), Vec3(HW, A, -4.95f), Vec3(0.42f, A, -4.95f), 0, 0, 0.75f * UV, 0.4f * UV);   // landing
    // two steps down to the door
    setm(m, 0x45474b, T_FLOOR);
    m.box(Mat4::identity(), Vec3(0.42f, 0.30f, -5.80f), Vec3(0.80f, 0.88f, -4.95f), 4 | 2 | 16, UV);
    m.box(Mat4::identity(), Vec3(0.80f, 0.30f, -5.80f), Vec3(HW, 0.58f, -4.95f), 4 | 16, UV);
    m.mat = MAT_EMIT; m.layer = -1; m.color(0xd8c23a);                                                           // yellow step nosings
    m.quad(Vec3(0.42f, A + 0.002f, -4.99f), Vec3(HW, A + 0.002f, -4.99f), Vec3(HW, A + 0.002f, -4.95f), Vec3(0.42f, A + 0.002f, -4.95f));
    // lower front wall and dash
    setm(m, 0x2a2c30, T_PLASTIC);
    m.quad(Vec3(-HW, 0.3f, kFront), Vec3(HW, 0.3f, kFront), Vec3(HW, 1.80f, kFront), Vec3(-HW, 1.80f, kFront), 0, 0, 2 * HW * UV, 1.5f * UV);
    m.roundBox(Mat4::identity(), Vec3(-HW, DF + 0.05f, -5.93f), Vec3(0.38f, 1.66f, -5.56f), 0.05f, 2, UV);
    m.roundBox(Mat4::translate(Vec3(-0.70f, 1.66f, -5.72f)) * Mat4::rotX(radf(-18)), Vec3(-0.34f, -0.02f, -0.14f), Vec3(0.34f, 0.15f, 0.12f), 0.04f, 2, UV);   // instrument binnacle
    m.mat = MAT_EMIT; m.layer = -1; m.color(0x2a6a55);                                                           // glowing dials
    for (int k = 0; k < 2; k++) {
        Mat4 D = Mat4::translate(Vec3(-0.84f + k * 0.28f, 1.735f, -5.602f)) * Mat4::rotX(radf(-18));
        m.quad(D.point(Vec3(-0.085f, -0.05f, 0)), D.point(Vec3(0.085f, -0.05f, 0)), D.point(Vec3(0.085f, 0.05f, 0)), D.point(Vec3(-0.085f, 0.05f, 0)));
    }
    // steering wheel and column
    setm(m, 0x18181a, T_PLASTIC);
    Mat4 Wm = Mat4::translate(Vec3(-0.70f, 1.80f, -5.40f)) * Mat4::rotX(radf(28));
    torus(m, Wm, 0.235f, 0.018f, 20, 6);
    m.cylinder(Wm, Vec3(0, 0, 0), Vec3(0, -0.34f, 0), 0.035f, 0.045f, 8, false);
    m.box(Wm, Vec3(-0.22f, -0.012f, -0.02f), Vec3(0.22f, 0.012f, 0.02f), 63, UV);
    m.cylinder(Wm, Vec3(0, -0.01f, 0), Vec3(0, 0.02f, 0), 0.07f, 0.065f, 10, true);
    // driver's seat + partition behind it
    addSeat(m, -0.70f, -5.02f, DF, 0x2c2f36, false, 9.f);
    setm(m, 0x8f8c84, T_PLASTIC);
    m.box(Mat4::identity(), Vec3(-HW, DF, -4.60f), Vec3(-0.14f, 2.18f, -4.56f), 63 & ~8, UV);
    setm(m, 0xb8b5ac, T_METAL);
    m.cylinder(Mat4::identity(), Vec3(-0.12f, A, -4.58f), Vec3(-0.12f, kCeil, -4.58f), 0.018f, 0.018f, 8, false);
    m.cylinder(Mat4::identity(), Vec3(0.46f, A, -4.62f), Vec3(0.46f, kCeil, -4.62f), 0.018f, 0.018f, 8, false);
    m.cylinder(Mat4::identity(), Vec3(0.46f, A + 0.95f, -4.62f), Vec3(0.46f, A + 0.95f, -5.60f), 0.016f, 0.016f, 8, false);
    setm(m, 0x8f8c84, T_PLASTIC);
    m.box(Mat4::identity(), Vec3(0.50f, F, -4.50f), Vec3(HW, F + 0.78f, -4.46f), 63 & ~8, UV);                  // modesty panel ahead of seat 3
    // windscreen surround: A-pillars, header, left front quarter, door frame
    setm(m, TRIMC, T_PLASTIC);
    m.quad(Vec3(-HW, 1.80f, kFront), Vec3(-1.09f, 1.80f, kFront), Vec3(-1.09f, 3.04f, kFront), Vec3(-HW, 3.04f, kFront));
    m.quad(Vec3(1.09f, 1.80f, kFront), Vec3(HW, 1.80f, kFront), Vec3(HW, 3.04f, kFront), Vec3(1.09f, 3.04f, kFront));
    m.quad(Vec3(-HW, 3.04f, kFront), Vec3(HW, 3.04f, kFront), Vec3(HW, kCeil, kFront), Vec3(-HW, kCeil, kFront));
    // left wall of the driver's bay: window from 1.95 to 2.9
    setm(m, WALL, T_TRIM);
    m.quad(Vec3(-HW, DF, zP0 + 0.05f), Vec3(-HW, DF, kFront), Vec3(-HW, 1.95f, kFront), Vec3(-HW, 1.95f, zP0 + 0.05f));
    setm(m, TRIMC, T_PLASTIC);
    m.quad(Vec3(-HW, 2.90f, zP0 + 0.05f), Vec3(-HW, 2.90f, kFront), Vec3(-HW, kWinTop + 0.03f, kFront), Vec3(-HW, kWinTop + 0.03f, zP0 + 0.05f));
    m.quad(Vec3(-HW, 1.95f, zP0 + 0.05f), Vec3(-HW, 1.95f, zP0 - 0.05f), Vec3(-HW, 2.90f, zP0 - 0.05f), Vec3(-HW, 2.90f, zP0 + 0.05f));
    // right wall of the entrance: the door (two glazed leaves in a dark frame)
    setm(m, 0x35373b, T_PLASTIC);
    m.quad(Vec3(HW, 0.30f, kFront), Vec3(HW, 0.30f, -5.82f), Vec3(HW, kWinTop + 0.03f, -5.82f), Vec3(HW, kWinTop + 0.03f, kFront));
    m.quad(Vec3(HW, 0.30f, -4.93f), Vec3(HW, 0.30f, zP0 + 0.05f), Vec3(HW, kWinTop + 0.03f, zP0 + 0.05f), Vec3(HW, kWinTop + 0.03f, -4.93f));
    m.quad(Vec3(HW, 0.30f, -5.40f), Vec3(HW, 0.30f, -5.35f), Vec3(HW, 2.95f, -5.35f), Vec3(HW, 2.95f, -5.40f));
    m.quad(Vec3(HW, 2.95f, -5.82f), Vec3(HW, 2.95f, -4.93f), Vec3(HW, kWinTop + 0.03f, -4.93f), Vec3(HW, kWinTop + 0.03f, -5.82f));
    m.quad(Vec3(HW, 0.30f, -5.82f), Vec3(HW, 0.30f, -4.93f), Vec3(HW, 0.62f, -4.93f), Vec3(HW, 0.62f, -5.82f));
    // glass: windscreen, driver's window, door
    g.color(0x8fb0b4, 22);
    g.quad(Vec3(-1.09f, 1.80f, kFront - 0.02f), Vec3(1.09f, 1.80f, kFront - 0.02f), Vec3(1.09f, 3.04f, kFront - 0.02f), Vec3(-1.09f, 3.04f, kFront - 0.02f));
    g.quad(Vec3(-HW - 0.02f, 1.95f, zP0 - 0.05f), Vec3(-HW - 0.02f, 1.95f, kFront), Vec3(-HW - 0.02f, 2.90f, kFront), Vec3(-HW - 0.02f, 2.90f, zP0 - 0.05f));
    g.quad(Vec3(HW + 0.02f, 0.62f, -5.82f), Vec3(HW + 0.02f, 0.62f, -4.93f), Vec3(HW + 0.02f, 2.95f, -4.93f), Vec3(HW + 0.02f, 2.95f, -5.82f));
    // wipers and the two "rabbit ear" mirrors outside the screen
    m.mat = MAT_LIT; m.layer = -1; m.color(0x141416);
    for (int sd = -1; sd <= 1; sd += 2) {
        m.box(Mat4::translate(Vec3(sd * 0.45f, 1.83f, kFront - 0.06f)) * Mat4::rotZ(radf(sd * 8.f)), Vec3(-0.40f, 0, -0.01f), Vec3(0.40f, 0.025f, 0.01f));
        Mat4 Mm = Mat4::translate(Vec3(sd * 1.33f, 2.42f, kFront - 0.45f));
        m.roundBox(Mm, Vec3(-0.11f, -0.20f, -0.05f), Vec3(0.11f, 0.20f, 0.05f), 0.04f, 1);
        m.cylinder(Mat4::identity(), Vec3(sd * 1.33f, 2.62f, kFront - 0.45f), Vec3(sd * 1.15f, 3.10f, kFront - 0.05f), 0.02f, 0.02f, 6, false);
    }
    // ---- info monitor hanging from the ceiling and the LED sign over the windscreen (their text is drawn by the app)
    setm(m, 0x1c1d20, T_PLASTIC);
    Vec3 mc = monitorCenter();
    m.roundBox(Mat4::translate(mc), Vec3(-0.34f, -0.21f, -0.05f), Vec3(0.34f, 0.21f, 0.0f), 0.015f, 1, UV);
    m.cylinder(Mat4::identity(), mc + Vec3(0, 0.2f, -0.03f), Vec3(mc.x, kCeil, mc.z - 0.03f), 0.02f, 0.02f, 6, false);
    Vec3 lc2 = ledCenter();
    m.box(Mat4::translate(lc2), Vec3(-0.72f, -0.115f, -0.08f), Vec3(0.72f, 0.115f, 0.0f), 63 & ~32, UV);
    // ---- the driver
    {
        m.mat = MAT_CABIN; m.layer = -1;
        m.color(0x1c2540);
        m.roundBox(Mat4::translate(Vec3(-0.70f, DF + 0.50f, -4.97f)) * Mat4::rotX(radf(6)), Vec3(-0.215f, 0, -0.12f), Vec3(0.215f, 0.56f, 0.10f), 0.07f, 2);     // torso
        m.color(0x141a2c);
        m.roundBox(Mat4::translate(Vec3(-0.70f, DF + 0.42f, -5.20f)), Vec3(-0.20f, 0, -0.25f), Vec3(0.20f, 0.15f, 0.20f), 0.06f, 1);                         // thighs
        m.color(0xc99f7e);
        m.roundBox(Mat4::translate(Vec3(-0.70f, DF + 1.09f, -4.96f)), Vec3(-0.085f, 0, -0.10f), Vec3(0.085f, 0.21f, 0.09f), 0.075f, 2);                       // head
        m.cylinder(Mat4::identity(), Vec3(-0.70f, DF + 1.02f, -4.95f), Vec3(-0.70f, DF + 1.10f, -4.95f), 0.05f, 0.05f, 8, false);
        m.color(0x101012);
        m.roundBox(Mat4::translate(Vec3(-0.70f, DF + 1.19f, -4.935f)), Vec3(-0.092f, 0, -0.085f), Vec3(0.092f, 0.125f, 0.105f), 0.07f, 2);                    // hair
        for (int sd = -1; sd <= 1; sd += 2) {
            Vec3 sh(-0.70f + sd * 0.215f, DF + 0.98f, -4.99f), el(-0.70f + sd * 0.27f, DF + 0.76f, -5.20f), hd(-0.70f + sd * 0.20f, 1.86f, -5.33f);
            m.color(0x1c2540);
            m.cylinder(Mat4::identity(), sh, el, 0.055f, 0.048f, 8, true); m.cylinder(Mat4::identity(), el, hd, 0.046f, 0.04f, 8, true);
            m.color(0xf2f0ea);
            m.roundBox(Mat4::translate(hd), Vec3(-0.045f, -0.03f, -0.07f), Vec3(0.045f, 0.035f, 0.03f), 0.025f, 1);                                        // white gloves
        }
    }
    // soft contact shadows: darken everything close to the floor
    for (Vtx& v : m.v) {
        if (v.mat != MAT_CABIN) continue;
        float h = v.py - (v.px > -0.10f && v.px < 0.50f ? A : F);
        float k = 0.62f + 0.38f * sstep(0.0f, 0.42f, h);
        if (v.pz < zP0) k = 0.7f + 0.3f * sstep(0.0f, 0.5f, v.py - DF);
        v.r = (uint8_t)(v.r * k); v.g = (uint8_t)(v.g * k); v.b = (uint8_t)(v.b * k);
    }
    opaque.upload(m); glass.upload(g);
    LOGI("bus interior: %zu tris", m.i.size() / 3);
}

void BusModel::buildPassengers(MeshData& out, int rider, uint32_t seed) const {
    out.clear(); out.mat = MAT_CABIN; out.layer = -1;
    if (rider < 0 || rider >= (int)seats.size()) return;
    static const int hair[] = {0x121214, 0x1a1512, 0x2a2420, 0x6a6a6c, 0x0c0c0e};
    static const int coat[] = {0x2b3038, 0x5a2a2a, 0x39485c, 0x7a7468, 0x1d1f24, 0x44523c};
    for (size_t i = 0; i < seats.size(); i++) {
        const SeatPos& sp = seats[i];
        if (fabsf(sp.z - seats[rider].z) < 1.7f) continue;                    // keep the rider's own surroundings empty
        uint32_t h = hash32(seed + (uint32_t)i * 7919u);
        if ((h % 100) >= 42) continue;
        float lean = (hashf(h + 1) - 0.5f) * 0.06f, ht = 0.02f * (hashf(h + 2) - 0.5f);
        Mat4 M = Mat4::translate(Vec3(sp.x + lean, kFloor, sp.z));
        out.color(coat[h % 6]);
        out.roundBox(M, Vec3(-0.21f, 0.50f, 0.02f), Vec3(0.21f, 1.03f, 0.25f), 0.07f, 1);       // shoulders / torso against the seat back
        out.color(0xc79f80);
        out.roundBox(M, Vec3(-0.08f, 1.06f + ht, 0.10f), Vec3(0.08f, 1.26f + ht, 0.28f), 0.07f, 2);
        out.color(hair[(h >> 8) % 5]);
        out.roundBox(M, Vec3(-0.088f, 1.15f + ht, 0.115f), Vec3(0.088f, 1.285f + ht, 0.30f), 0.07f, 2);
    }
}
