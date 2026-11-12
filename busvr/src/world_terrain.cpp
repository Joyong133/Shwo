// Terrain chunk generators: far tiles (128 m+ grid), near tiles (32 m grid, corridor carved in).
#include "world.h"

static inline int8_t pk8(float v) { return (int8_t)lroundf(clampf(v, -1.f, 1.f) * 127.f); }

static TVtx tv(const Vec3& p, const Vec3& n, const float w[6]) {
    TVtx t; t.px = p.x; t.py = p.y; t.pz = p.z; t.nx = pk8(n.x); t.ny = pk8(n.y); t.nz = pk8(n.z); t.pad = 0;
    t.r = (uint8_t)(sat(w[0]) * 255); t.g = (uint8_t)(sat(w[1]) * 255); t.b = (uint8_t)(sat(w[2]) * 255); t.a = (uint8_t)(sat(w[3]) * 255);
    t.u = w[4]; t.v = w[5]; return t;
}
TVtx makeTVtx(const Vec3& p, const Vec3& n, const float w[6]) { return tv(p, n, w); }

// ---------------------------------------------------------------- far tile
void World::genFar(int jx, int jn, int lod, ChunkData& out) {
    const Terrain& T = d.terr;
    int st = 1 << lod; int cells = 32 / st; int nv = cells + 1;
    double ox = T.X0 + (jx + 0.5) * T.FT + 16, on = T.N0 + (jn + 0.5) * T.FT + 16;
    out.origin = Vec3d(ox, 0, -on);
    auto& V = out.terrain.v; auto& I = out.terrain.i;
    float ymin = 1e9f, ymax = -1e9f;
    for (int a = 0; a < nv; a++) for (int b = 0; b < nv; b++) {
        int gi = jx * 32 + b * st, gj = jn * 32 + a * st;
        float h = T.nodeFar(gi, gj);
        float hx0 = T.nodeFar(gi - st, gj), hx1 = T.nodeFar(gi + st, gj), hn0 = T.nodeFar(gi, gj - st), hn1 = T.nodeFar(gi, gj + st);
        float sp = 128.f * st;
        // world: X east, Z = -north. dh/dZ = -dh/dn
        Vec3 n = normalize(Vec3(-(hx1 - hx0) / (2 * sp), 1.f, (hn1 - hn0) / (2 * sp)));
        double x = T.X0 + gi * 128.0 + 16, nn_ = T.N0 + gj * 128.0 + 16;
        float w[6]; lcWeights(T.lcFar(x + 1, nn_ + 1), w);
        if (w[4] > 0.5f) n = Vec3(0, 1, 0);
        // faint grey trace where the expressway runs, so the road reads from far away
        RouteProj rp;
        if (lod == 0 && w[4] < 0.5f && d.route.project(x, -nn_, 90.f, rp) && d.route.kind[rp.i] == RK_EXP && !(d.route.flags[rp.i] & RF_TUNNEL)) { w[3] = std::max(w[3], 0.6f); w[0] *= 0.4f; w[1] *= 0.4f; w[2] *= 0.4f; }
        V.push_back(tv(Vec3((float)(x - ox), h, (float)(-(nn_ - on))), n, w));
        ymin = std::min(ymin, h); ymax = std::max(ymax, h);
    }
    // a: north index (towards -Z), b: east index (towards +X). Seen from above: (a,b),(a,b+1) east; (a+1,*) north => CCW = (a,b),(a,b+1),(a+1,b+1),(a+1,b)
    for (int a = 0; a < cells; a++) for (int b = 0; b < cells; b++) {
        uint32_t i0 = a * nv + b, i1 = i0 + 1, i2 = i0 + nv + 1, i3 = i0 + nv;
        I.push_back(i0); I.push_back(i1); I.push_back(i2); I.push_back(i0); I.push_back(i2); I.push_back(i3);
    }
    // skirts hide cracks between tiles of different detail
    auto skirt = [&](int a0, int b0, int da, int db, bool flip) {
        uint32_t base = (uint32_t)V.size();
        for (int k = 0; k < nv; k++) { TVtx t = V[(a0 + da * k) * nv + (b0 + db * k)]; V.push_back(t); t.py -= 90.f; V.push_back(t); }
        for (int k = 0; k < cells; k++) {
            uint32_t p = base + k * 2;
            if (flip) { I.push_back(p); I.push_back(p + 3); I.push_back(p + 2); I.push_back(p); I.push_back(p + 1); I.push_back(p + 3); }
            else { I.push_back(p); I.push_back(p + 2); I.push_back(p + 3); I.push_back(p); I.push_back(p + 3); I.push_back(p + 1); }
        }
    };
    skirt(0, 0, 0, 1, true); skirt(cells, 0, 0, 1, false); skirt(0, 0, 1, 0, false); skirt(0, cells, 1, 0, true);
    float half = T.FT * 0.5f;
    out.origin.y = 0.5 * (ymin + ymax);
    for (auto& t : V) t.py -= (float)out.origin.y;
    out.radius = sqrtf(2 * half * half + 0.25f * (ymax - ymin + 90) * (ymax - ymin + 90));
}

// ---------------------------------------------------------------- near tile
void World::genNear(int jx, int jn, ChunkData& out) {
    const Terrain& T = d.terr; const Route& R = d.route;
    const int nv = 33;
    double ox = T.X0 + (jx + 0.5) * T.NT + 16, on = T.N0 + (jn + 0.5) * T.NT + 16;
    // heights on a 35x35 grid (one extra ring for normals)
    static thread_local std::vector<float> H; H.assign(35 * 35, 0);
    std::vector<uint8_t> inCorr(35 * 35, 0);
    float ymin = 1e9f, ymax = -1e9f;
    for (int a = -1; a <= 33; a++) for (int b = -1; b <= 33; b++) {
        double x = T.X0 + (jx * 32 + b) * 32.0 + 16, nn_ = T.N0 + (jn * 32 + a) * 32.0 + 16;
        RouteProj rp; float h = d.ground(x, -nn_, &rp);
        if (rp.dist < 1e8f) {
            float eL = R.extL[rp.i], eR = R.extR[rp.i];
            float q = rp.lat > 0 ? rp.lat - eR : -rp.lat - eL;
            float lim = rp.lat > 0 ? R.limR[rp.i] : R.limL[rp.i];
            if (q < 0.7f * lim - 16.f) { h -= 3.5f; inCorr[(a + 1) * 35 + (b + 1)] = 1; }
        }
        H[(a + 1) * 35 + (b + 1)] = h;
    }
    auto& V = out.terrain.v; auto& I = out.terrain.i;
    for (int a = 0; a < nv; a++) for (int b = 0; b < nv; b++) {
        float h = H[(a + 1) * 35 + (b + 1)];
        float hx0 = H[(a + 1) * 35 + b], hx1 = H[(a + 1) * 35 + b + 2], hn0 = H[a * 35 + b + 1], hn1 = H[(a + 2) * 35 + b + 1];
        Vec3 n = normalize(Vec3(-(hx1 - hx0) / 64.f, 1.f, (hn1 - hn0) / 64.f));
        double x = T.X0 + (jx * 32 + b) * 32.0 + 16, nn_ = T.N0 + (jn * 32 + a) * 32.0 + 16;
        float w[6] = {0, 0, 0, 0, 0, 0};
        for (int k = 0; k < 4; k++) { float t[6]; lcWeights(T.lc(x + ((k & 1) ? 8 : -8), nn_ + ((k & 2) ? 8 : -8)), t); for (int c = 0; c < 6; c++) w[c] += 0.25f * t[c]; }
        if (w[4] > 0.6f) n = Vec3(0, 1, 0);
        if (inCorr[(a + 1) * 35 + (b + 1)]) { w[4] = 0; }
        V.push_back(tv(Vec3((float)(x - ox), h, (float)(-(nn_ - on))), n, w));
        ymin = std::min(ymin, h); ymax = std::max(ymax, h);
    }
    const int cells = 32;
    for (int a = 0; a < cells; a++) for (int b = 0; b < cells; b++) {
        uint32_t i0 = a * nv + b, i1 = i0 + 1, i2 = i0 + nv + 1, i3 = i0 + nv;
        I.push_back(i0); I.push_back(i1); I.push_back(i2); I.push_back(i0); I.push_back(i2); I.push_back(i3);
    }
    auto skirt = [&](int a0, int b0, int da, int db, bool flip) {
        uint32_t base = (uint32_t)V.size();
        for (int k = 0; k < nv; k++) { TVtx t = V[(a0 + da * k) * nv + (b0 + db * k)]; V.push_back(t); t.py -= 45.f; V.push_back(t); }
        for (int k = 0; k < cells; k++) {
            uint32_t p = base + k * 2;
            if (flip) { I.push_back(p); I.push_back(p + 3); I.push_back(p + 2); I.push_back(p); I.push_back(p + 1); I.push_back(p + 3); }
            else { I.push_back(p); I.push_back(p + 2); I.push_back(p + 3); I.push_back(p); I.push_back(p + 3); I.push_back(p + 1); }
        }
    };
    skirt(0, 0, 0, 1, true); skirt(cells, 0, 0, 1, false); skirt(0, 0, 1, 0, false); skirt(0, cells, 1, 0, true);
    out.origin = Vec3d(ox, 0.5 * (ymin + ymax), -on);
    for (auto& t : V) t.py -= (float)out.origin.y;
    float half = T.NT * 0.5f;
    out.radius = sqrtf(2 * half * half + 0.25f * (ymax - ymin + 45) * (ymax - ymin + 45));
}
