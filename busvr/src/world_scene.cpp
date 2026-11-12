// Scenery chunk (512 m tiles): real building footprints, trees from land cover, the other roads.
#include "world.h"

void addBill(BillMeshData& m, const Vec3& p, float hw, float h0, float h1, float u0, float v0, float u1, float v1, uint32_t rgba);

enum Facade { F_APT = 0, F_WALL = 1, F_OFFICE = 2, F_LOWRISE = 3, F_HOUSE = 4, F_INDUST = 5, F_ROOF = 6, F_SHOP = 7 };

static void wallQuad(MeshData& m, const Vec3& a, const Vec3& b, float h, float uLen, float vLen, float layer, uint8_t mat) {
    m.layer = layer; m.mat = mat;
    float u1 = std::max(1.f, floorf(length(b - a) / uLen + 0.5f)), v1 = std::max(1.f, floorf(h / vLen + 0.5f));
    m.quad(a, b, b + Vec3(0, h, 0), a + Vec3(0, h, 0), 0, 0, u1, v1);
}

static void addBuilding(MeshData& m, const Vec3& c, float ang, float len, float wid, float h, int type, uint32_t seed) {
    float ca = cosf(ang), sa = sinf(ang);
    Vec3 ax(ca, 0, -sa), az(sa, 0, ca);
    Vec3 hx = ax * (len * 0.5f), hz = az * (wid * 0.5f);
    Vec3 p[4] = {c - hx + hz, c + hx + hz, c + hx - hz, c - hx - hz};      // +z side first: counter-clockwise seen from above
    uint8_t rnd = (uint8_t)(hash32(seed) & 255);
    auto tint = [&](int hex) { m.color(hex, rnd); };
    float r1 = hashf(seed * 3 + 1), r2 = hashf(seed * 7 + 5);
    if (type == 5) {    // greenhouse: low white arch
        m.mat = MAT_LIT; m.layer = -1; tint(0xe4ebe8);
        const int NS = 4; Vec3 prev = c - hz;
        for (int k = 1; k <= NS; k++) {
            float t = (float)k / NS; Vec3 cur = c - hz + az * (wid * t) + Vec3(0, h * sinf(t * PI), 0);
            m.quad(prev - hx, cur - hx, cur + hx, prev + hx);
            prev = cur;
        }
        return;
    }
    float flo = 3.1f, bay = 4.f, layerLong = F_LOWRISE, layerShort = F_LOWRISE; uint8_t mat = MAT_WINDOW; int wallCol = 0xd8d2c4, roofCol = 0x8f8f8a;
    bool gable = false;
    static const int aptCols[] = {0xe9e6dd, 0xdcd8cc, 0xe4dccd, 0xd3d8dc, 0xe8e2d2, 0xcfd3d0};
    static const int lowCols[] = {0xcfc7b8, 0xb9b2a6, 0xd9d3c8, 0xa9a39a, 0xc8b9a4, 0xb4bcc0, 0xd6c9b6, 0x9f9a92};
    static const int roofCols[] = {0x3f6ea6, 0xbf5f2c, 0x4d7a57, 0x8a3c2b, 0x4c4c4c, 0x2f5f8f, 0xb8492f};
    static const int indCols[] = {0xc9cdd0, 0xa8b7c4, 0xd6d3cb, 0x9fb0a6, 0xbfc5c9};
    switch (type) {
        case 1: flo = 2.85f; bay = 3.4f; layerLong = F_APT; layerShort = F_WALL; wallCol = aptCols[hash32(seed >> 8) % 6]; roofCol = 0x9a9a94; break;
        case 2: flo = 3.2f; bay = 5.f; layerLong = layerShort = F_HOUSE; wallCol = lowCols[hash32(seed) % 8]; roofCol = roofCols[hash32(seed * 5) % 7]; gable = true; break;
        case 3: flo = 6.f; bay = 6.f; layerLong = layerShort = F_INDUST; wallCol = indCols[hash32(seed) % 5]; roofCol = indCols[hash32(seed * 3) % 5]; gable = true; mat = MAT_LIT; break;
        case 4: flo = 3.6f; bay = 3.6f; layerLong = layerShort = (h > 30 ? F_OFFICE : F_SHOP); wallCol = h > 30 ? 0xc9d2d8 : lowCols[hash32(seed) % 8]; break;
        case 6: flo = 3.6f; bay = 4.f; layerLong = layerShort = F_LOWRISE; wallCol = 0xd9cfb8; break;
        default: flo = 3.1f; bay = 4.f; layerLong = layerShort = (r1 < 0.45f ? F_SHOP : F_LOWRISE); wallCol = lowCols[hash32(seed) % 8]; break;
    }
    float wallH = gable ? h * (type == 3 ? 0.82f : 0.68f) : h;
    for (int k = 0; k < 4; k++) {
        bool lng = (k % 2) == 0;
        tint(wallCol);
        wallQuad(m, p[k], p[(k + 1) % 4], wallH, bay, flo, lng ? layerLong : layerShort, (type == 1 && !lng) ? MAT_LIT : mat);
    }
    m.mat = MAT_LIT;
    Vec3 up(0, wallH, 0);
    if (gable) {
        float rh = h - wallH; Vec3 r0 = c - hx + Vec3(0, h, 0), r1p = c + hx + Vec3(0, h, 0);
        m.layer = -1; m.color(roofCol);
        m.quad(p[0] + up, p[1] + up, r1p, r0); m.quad(p[2] + up, p[3] + up, r0, r1p);
        m.color(wallCol);
        uint32_t i0 = m.vert(p[1] + up, ax, 0, 0); m.vert(p[2] + up, ax, 1, 0); m.vert(r1p, ax, 0.5f, 1); m.tri(i0, i0 + 1, i0 + 2);
        i0 = m.vert(p[3] + up, -ax, 0, 0); m.vert(p[0] + up, -ax, 1, 0); m.vert(r0, -ax, 0.5f, 1); m.tri(i0, i0 + 1, i0 + 2);
        (void)rh;
    } else {
        m.layer = F_ROOF; m.color(roofCol);
        m.quad(p[0] + up, p[1] + up, p[2] + up, p[3] + up, 0, 0, len / 6.f, wid / 6.f);
        if (type == 1 || (type == 4 && h > 20)) {      // lift / water-tank housing
            m.layer = -1; m.color(wallCol);
            float bw = std::min(wid * 0.5f, 5.f), bl = std::min(len * 0.25f, 7.f);
            Mat4 M = Mat4::basis(ax, Vec3(0, 1, 0), az, c + up);
            float ox = (r2 - 0.5f) * len * 0.4f;
            m.box(M, Vec3(ox - bl / 2, 0, -bw / 2), Vec3(ox + bl / 2, 3.2f, bw / 2), 63 & ~8);
        }
    }
}

void World::genScene(int jx, int jn, int lod, ChunkData& out) {
    const Route& R = d.route;
    double tx0 = d.bX0 + jx * (double)d.bT, tn0 = d.bN0 + jn * (double)d.bT;
    double ox = tx0 + d.bT * 0.5, on = tn0 + d.bT * 0.5;
    out.origin = Vec3d(ox, d.terr.dem(ox, on), -on);
    float rad = d.bT * 0.75f;
    MeshData& L = out.lit;

    // ---------------- buildings
    if (jx >= 0 && jn >= 0 && jx < d.bnx && jn < d.bnn) {
        size_t idx = (size_t)jn * d.bnx + jx; uint32_t first = d.bdir[idx * 2], cnt = d.bdir[idx * 2 + 1];
        for (uint32_t k = 0; k < cnt; k++) {
            const BuildingRec& b = d.bld[first + k];
            float len = b.l * 0.1f, wid = b.w * 0.1f, h = b.h * 0.1f;
            if (lod >= 1 && h < 11.f && len * wid < 450.f) continue;
            if (lod >= 2 && h < 30.f) continue;
            double X = d.bX0 + b.x, Z = -(d.bN0 + b.n);
            float ang = b.a / 256.f * PI, ca = cosf(ang), sa = sinf(ang);
            float gy = 1e9f;
            for (int c = 0; c < 5; c++) {
                float fx = (c == 0) ? 0 : ((c & 1) ? 0.45f : -0.45f) * len, fz = (c == 0) ? 0 : ((c & 2) ? 0.45f : -0.45f) * wid;
                gy = std::min(gy, d.ground(X + ca * fx + sa * fz, Z - sa * fx + ca * fz));
            }
            Vec3 c((float)(X - out.origin.x), gy - 0.4f - (float)out.origin.y, (float)(Z - out.origin.z));
            uint32_t seed = hash2((int)(b.x * 4), (int)(b.n * 4));
            if (b.t == 1) seed = (seed & 0xFF) | (hash2((int)(X / 220), (int)(Z / 220)) << 8);      // one colour scheme per apartment complex
            addBuilding(L, c, ang, len, wid, h + 0.4f, b.t, seed);
            rad = std::max(rad, length(c) + len + h);
        }
    }

    // ---------------- trees from land cover
    if (lod <= 1) {
        const int NC = 32;
        for (int cj = 0; cj < NC; cj++) for (int cxi = 0; cxi < NC; cxi++) {
            double cx = tx0 + (cxi + 0.5) * 16.0, cn = tn0 + (cj + 0.5) * 16.0;
            int lc = d.terr.lc(cx, cn);
            uint32_t h0 = hash2((int)floor(cx / 16), (int)floor(cn / 16));
            int count = 0; float sizeMul = 1.f;
            if (lc == LC_TREE) { count = lod == 0 ? 2 : ((h0 & 1) ? 1 : 0); sizeMul = lod == 0 ? 1.f : 1.5f; }
            else if (lc == LC_SHRUB) count = (h0 & 1);
            else if (lc == LC_BUILT) count = lod == 0 && (h0 % 9 == 0) ? 1 : 0;
            else if (lc == LC_CROP || lc == LC_GRASS) count = lod == 0 && (h0 % 23 == 0) ? 1 : 0;
            for (int t = 0; t < count; t++) {
                uint32_t hs = hash32(h0 + 977 * t);
                double X = cx + (hashf(hs) - 0.5) * 16.0, Zn = cn + (hashf(hs + 1) - 0.5) * 16.0;
                RouteProj rp; float gy = d.ground(X, -Zn, &rp);
                if (rp.dist < 1e8f) {
                    float q = rp.lat > 0 ? rp.lat - R.extR[rp.i] : -rp.lat - R.extL[rp.i];
                    if (q < 7.f || (q < 30.f && R.wTunnel[rp.i] > 0.3f)) continue;
                }
                float r = hashf(hs + 2), r2 = hashf(hs + 3);
                int sprite; float hgt;
                if (lc == LC_SHRUB) { sprite = 5; hgt = 2.5f + 2.5f * r; }
                else if (lc == LC_BUILT) { sprite = 7; hgt = 7.f + 4.f * r; }
                else if (lc == LC_CROP || lc == LC_GRASS) { sprite = (r2 < 0.5f) ? 4 : 2; hgt = 8.f + 6.f * r; }
                else { sprite = r2 < 0.42f ? (r2 < 0.2f ? 0 : 1) : (r2 < 0.75f ? 2 : 3); hgt = (9.f + 8.f * r) * sizeMul; }
                float hw = hgt * (sprite == 4 ? 0.22f : (sprite <= 1 ? 0.36f : 0.44f));
                int sv = (int)(170 + 85 * hashf(hs + 4));
                float u0 = (sprite % 4) * 0.25f, v0 = (sprite / 4) * 0.5f;
                Vec3 p((float)(X - out.origin.x), gy - 0.3f - (float)out.origin.y, (float)(-Zn - out.origin.z));
                addBill(out.trees, p, hw, 0, hgt, u0 + 0.004f, v0 + 0.004f, u0 + 0.246f, v0 + 0.496f, ((uint32_t)sv << 24) | ((uint32_t)sv << 16) | ((uint32_t)sv << 8) | (uint32_t)(sprite <= 1 ? 0 : (sprite == 7 ? 128 : 255)));
            }
        }
    }

    // ---------------- other roads (one 1024 m road tile per four scenery tiles)
    if (lod <= 1 && (jx & 1) == 0 && (jn & 1) == 0) {
        int rx = jx / 2, rn = jn / 2;
        if (rx >= 0 && rn >= 0 && rx < d.rnx && rn < d.rnn) {
            size_t idx = (size_t)rn * d.rnx + rx; uint32_t first = d.rdir[idx * 2], cnt = d.rdir[idx * 2 + 1];
            MeshData& D = out.decal;
            for (uint32_t k = 0; k < cnt; k++) {
                const uint8_t* p = d.rbody.data() + d.roff[first + k];
                uint8_t cls = p[0]; uint16_t np; float wdt; memcpy(&np, p + 2, 2); memcpy(&wdt, p + 4, 4); p += 8;
                if (np < 2) continue;
                std::vector<Vec3> c(np); std::vector<float> gnd(np), ya(np);
                for (int q = 0; q < np; q++) {
                    float v[4]; memcpy(v, p + q * 16, 16);
                    double X = d.rX0 + v[0], Z = -(d.rN0 + v[1]);
                    gnd[q] = d.ground(X, Z) + 0.22f; ya[q] = v[2];
                    c[q] = Vec3((float)(X - out.origin.x), 0, (float)(Z - out.origin.z));
                }
                for (int q = 0; q < np; q++) {
                    float y = gnd[q];
                    if (ya[q] > -900.f) y = std::max(ya[q], gnd[q]);
                    else if (ya[q] > -5000.f) {          // approach ramp step: blend from the deck down to the ground
                        float step = -1000.f - ya[q]; float deck = gnd[q];
                        for (int e = 1; e <= 10; e++) {
                            if (q - e >= 0 && ya[q - e] > -900.f) { deck = ya[q - e]; break; }
                            if (q + e < np && ya[q + e] > -900.f) { deck = ya[q + e]; break; }
                        }
                        float t = sstep(0, 10, step); y = std::max(lerpf(deck, gnd[q], t), gnd[q]);
                    }
                    c[q].y = y - (float)out.origin.y;
                }
                float hw = wdt * 0.5f; uint32_t base = (uint32_t)D.v.size(); float along = 0;
                for (int q = 0; q < np; q++) {
                    Vec3 dir = normalize(Vec3(c[std::min(q + 1, np - 1)].x - c[std::max(q - 1, 0)].x, 0, c[std::min(q + 1, np - 1)].z - c[std::max(q - 1, 0)].z));
                    Vec3 rt(-dir.z, 0, dir.x);
                    if (q > 0) along += length(Vec3(c[q].x - c[q - 1].x, 0, c[q].z - c[q - 1].z));
                    D.cr = 2; D.cg = 6; D.cb = 0; D.ca = 255; D.layer = wdt; (void)cls;
                    D.vert(c[q] - rt * hw, Vec3(0, 1, 0), -hw, along); D.vert(c[q] + rt * hw, Vec3(0, 1, 0), hw, along);
                    rad = std::max(rad, length(c[q]) + hw);
                    // retaining walls / parapets where the road stands clear of the ground
                    float clear = c[q].y + (float)out.origin.y - gnd[q];
                    if (q > 0) {
                        float clear0 = c[q - 1].y + (float)out.origin.y - gnd[q - 1];
                        if (clear > 0.7f || clear0 > 0.7f) {
                            Vec3 d0 = normalize(Vec3(c[q].x - c[q - 1].x, 0, c[q].z - c[q - 1].z)); Vec3 r0(-d0.z, 0, d0.x);
                            L.mat = MAT_LIT; L.layer = -1; L.color(0xaeaba2);
                            for (int sd = -1; sd <= 1; sd += 2) {
                                Vec3 a = c[q - 1] + r0 * (hw * sd), b = c[q] + r0 * (hw * sd);
                                Vec3 a0 = a - Vec3(0, std::min(clear0 + 0.4f, 2.2f), 0), b0 = b - Vec3(0, std::min(clear + 0.4f, 2.2f), 0), a1 = a + Vec3(0, 0.95f, 0), b1 = b + Vec3(0, 0.95f, 0);
                                if (sd > 0) { L.quad(a0, b0, b1, a1); L.quad(b0, a0, a1, b1); } else { L.quad(b0, a0, a1, b1); L.quad(a0, b0, b1, a1); }
                            }
                            if (clear > 5.f && (q % 3) == 0) {    // piers
                                L.color(0x8f8c85);
                                L.box(Mat4::basis(r0, Vec3(0, 1, 0), -d0, c[q]), Vec3(-hw * 0.5f, -clear - 1.5f, -0.6f), Vec3(hw * 0.5f, -1.2f, 0.6f), 1 | 2 | 16 | 32);
                            }
                        }
                    }
                }
                for (int q = 0; q + 1 < np; q++) { uint32_t a = base + q * 2; D.tri(a, a + 1, a + 3); D.tri(a, a + 3, a + 2); }
            }
        }
    }
    out.radius = rad;
}
