// Loading and querying the baked world data.
#include "world.h"

struct Rd {
    const uint8_t* p; const uint8_t* e;
    template <class T> T get() { T v{}; if (p + sizeof(T) <= e) memcpy(&v, p, sizeof(T)); p += sizeof(T); return v; }
    template <class T> void arr(std::vector<T>& out, size_t n) { out.resize(n); if (p + n * sizeof(T) <= e) memcpy(out.data(), p, n * sizeof(T)); p += n * sizeof(T); }
    std::string str(size_t n) { std::string s((const char*)p, strnlen((const char*)p, n)); p += n; return s; }
};

bool Route::load() {
    std::vector<uint8_t> raw;
    if (!readAssetZ("route.bin", raw)) return false;
    Rd r{raw.data(), raw.data() + raw.size()};
    r.p += 4; N = (int)r.get<uint32_t>(); step = r.get<float>();
    r.arr(x, N); r.arr(z, N);
    r.arr(y, N); r.arr(off, N); r.arr(v, N); r.arr(t, N); r.arr(extL, N); r.arr(extR, N); r.arr(W, N);
    r.arr(lanes, N); r.arr(kind, N); r.arr(flags, N);
    uint32_t ns = r.get<uint32_t>();
    for (uint32_t i = 0; i < ns; i++) { Stop s; s.s = r.get<float>(); s.dwell = r.get<float>(); s.type = (int)r.get<uint32_t>(); stops.push_back(s); }
    uint32_t np = r.get<uint32_t>();
    for (uint32_t i = 0; i < np; i++) { Place p; p.s = r.get<float>(); p.type = (int)r.get<uint32_t>(); p.name = r.str(48); places.push_back(p); }
    uint32_t nr = r.get<uint32_t>();
    for (uint32_t i = 0; i < nr; i++) { float s = r.get<float>(); regions.push_back({s, r.str(48)}); }
    S_TG = r.get<float>(); S_REST = r.get<float>(); S_PARK = r.get<float>(); S_EXITTOLL = r.get<float>();
    LEAD_S = r.get<float>(); REST_LANE = r.get<float>(); total = r.get<float>(); S_ENTER = r.get<float>();
    lon0 = r.get<double>(); lat0 = r.get<double>();
    if (r.p > r.e || N < 16) { LOGE("route.bin truncated"); return false; }

    // curvature (positive = turning right) and the lateral reach the corridor mesh may use on each side
    curv.assign(N, 0); limL.assign(N, 120); limR.assign(N, 120);
    for (int i = 2; i < N - 2; i++) {
        double ax = x[i] - x[i - 2], az = z[i] - z[i - 2], bx = x[i + 2] - x[i], bz = z[i + 2] - z[i];
        double la = sqrt(ax * ax + az * az), lb = sqrt(bx * bx + bz * bz);
        if (la < 1e-6 || lb < 1e-6) continue;
        curv[i] = (float)((ax * bz - az * bx) / (la * lb) / (0.5 * (la + lb)));
    }
    for (int i = 0; i < N; i++) {
        float cr = 0, cl = 0;
        for (int k = std::max(0, i - 12); k <= std::min(N - 1, i + 12); k++) { cr = std::max(cr, curv[k]); cl = std::max(cl, -curv[k]); }
        if (cr > 1e-5f) limR[i] = clampf(0.5f / cr - extR[i], 4.f, 120.f);
        if (cl > 1e-5f) limL[i] = clampf(0.5f / cl - extL[i], 4.f, 120.f);
        if (kind[i] != RK_EXP) { limL[i] = std::min(limL[i], 40.f); limR[i] = std::min(limR[i], 40.f); }
    }
    // smooth "inside a bridge / tunnel" weights
    wBridge.assign(N, 0); wTunnel.assign(N, 0);
    auto spread = [&](std::vector<float>& w, uint16_t flag, float range) {
        std::vector<float> dist(N, 1e9f);
        float d = 1e9f;
        for (int i = 0; i < N; i++) { d = (flags[i] & flag) ? 0 : d + step; dist[i] = d; }
        d = 1e9f;
        for (int i = N - 1; i >= 0; i--) { d = (flags[i] & flag) ? 0 : d + step; dist[i] = std::min(dist[i], d); }
        for (int i = 0; i < N; i++) w[i] = 1.f - sstep(0, range, dist[i]);
    };
    spread(wBridge, RF_BRIDGE, 14.f); spread(wTunnel, RF_TUNNEL, 9.f);

    // spatial hash over every 2nd sample
    double x1 = -1e18, z1 = -1e18; hx0 = 1e18; hz0 = 1e18;
    for (int i = 0; i < N; i++) { hx0 = std::min(hx0, x[i]); hz0 = std::min(hz0, z[i]); x1 = std::max(x1, x[i]); z1 = std::max(z1, z[i]); }
    hx0 -= 512; hz0 -= 512; hnx = (int)((x1 - hx0) / 256) + 3; hnz = (int)((z1 - hz0) / 256) + 3;
    std::vector<uint32_t> cnt((size_t)hnx * hnz + 1, 0);
    auto cell = [&](int i) { return (size_t)((int)((z[i] - hz0) / 256)) * hnx + (int)((x[i] - hx0) / 256); };
    for (int i = 0; i < N; i += 2) cnt[cell(i) + 1]++;
    for (size_t c = 1; c < cnt.size(); c++) cnt[c] += cnt[c - 1];
    hoff = cnt; hidx.resize(cnt.back());
    std::vector<uint32_t> fill(hoff.begin(), hoff.end() - 1);
    for (int i = 0; i < N; i += 2) hidx[fill[cell(i)]++] = (uint32_t)i;
    LOGI("route: %d samples, %.1f km, %zu places", N, length() / 1000.f, places.size());
    return true;
}

Vec3d Route::center(double s) const {
    double f = s / step; int i = (int)floor(f);
    if (i < 1) i = 1; if (i > N - 3) i = N - 3;
    double u = f - i; if (u < -1) u = -1; if (u > 2) u = 2;
    auto cr = [&](double p0, double p1, double p2, double p3) {
        return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
    };
    return Vec3d(cr(x[i - 1], x[i], x[i + 1], x[i + 2]), cr(y[i - 1], y[i], y[i + 1], y[i + 2]), cr(z[i - 1], z[i], z[i + 1], z[i + 2]));
}
void Route::frame(double s, Vec3d& pos, Vec3& fwd, Vec3& right) const {
    pos = center(s);
    Vec3d a = center(s - 1.0), b = center(s + 1.0);
    Vec3 d((float)(b.x - a.x), 0, (float)(b.z - a.z));
    fwd = normalize(d); right = Vec3(-fwd.z, 0, fwd.x);
}
bool Route::project(double X, double Z, float maxDist, RouteProj& out) const {
    int cx = (int)floor((X - hx0) / 256), cz = (int)floor((Z - hz0) / 256);
    int r = (int)ceilf(maxDist / 256.f);
    double best = (double)maxDist * maxDist * 1.5 + 1e3; int bi = -1;
    for (int dz = -r; dz <= r; dz++) {
        int zz = cz + dz; if (zz < 0 || zz >= hnz) continue;
        for (int dx = -r; dx <= r; dx++) {
            int xx = cx + dx; if (xx < 0 || xx >= hnx) continue;
            size_t c = (size_t)zz * hnx + xx;
            for (uint32_t k = hoff[c]; k < hoff[c + 1]; k++) {
                int i = (int)hidx[k]; double ddx = x[i] - X, ddz = z[i] - Z, d2 = ddx * ddx + ddz * ddz;
                if (d2 < best) { best = d2; bi = i; }
            }
        }
    }
    if (bi < 0) return false;
    double bd = 1e18;
    for (int k = std::max(0, bi - 2); k <= std::min(N - 2, bi + 1); k++) {
        double ax = x[k], az = z[k], dx = x[k + 1] - ax, dz = z[k + 1] - az, l2 = dx * dx + dz * dz;
        double u = l2 > 1e-9 ? ((X - ax) * dx + (Z - az) * dz) / l2 : 0;
        if (u < 0) u = 0; if (u > 1) u = 1;
        double px = ax + dx * u - X, pz = az + dz * u - Z, d2 = px * px + pz * pz;
        if (d2 < bd) {
            bd = d2; double l = sqrt(l2);
            out.i = k; out.u = (float)u; out.s = (k + u) * step;
            out.lat = l > 1e-9 ? (float)(((X - ax) * (-dz) + (Z - az) * dx) / l) : 0;
            out.dist = (float)sqrt(d2);
        }
    }
    return out.dist <= maxDist;
}
const char* Route::regionAt(double s) const {
    const char* r = ""; for (auto& p : regions) if (s >= p.first) r = p.second.c_str(); return r;
}
void Route::lonLat(double s, double& lon, double& lat) const {
    Vec3d c = center(s); lat = lat0 + (-c.z) / 111000.0; lon = lon0 + c.x / (111320.0 * cos(lat * 3.14159265 / 180.0));
}

bool Terrain::load() {
    std::vector<uint8_t> raw;
    if (!readAssetZ("terrain.bin", raw)) return false;
    Rd r{raw.data(), raw.data() + raw.size()};
    r.p += 4; X0 = r.get<double>(); N0 = r.get<double>(); NT = (float)r.get<double>(); FT = (float)r.get<double>();
    nx = (int)r.get<uint32_t>(); nn = (int)r.get<uint32_t>(); fx = (int)r.get<uint32_t>(); fn = (int)r.get<uint32_t>();
    uint32_t nNear = r.get<uint32_t>(), nFar = r.get<uint32_t>();
    r.arr(ndir, (size_t)nx * nn); r.arr(fdir, (size_t)fx * fn);
    nh.resize((size_t)nNear * 1089); nlc.resize((size_t)nNear * 4096); fh.resize((size_t)nFar * 1089); flc.resize((size_t)nFar * 1024);
    auto undelta = [](uint16_t* h) { for (int a = 0; a < 33; a++) for (int b = 1; b < 33; b++) h[a * 33 + b] = (uint16_t)(h[a * 33 + b] + h[a * 33 + b - 1]); };
    for (uint32_t k = 0; k < nNear; k++) {
        if (r.p + 1089 * 2 + 4096 > r.e) { LOGE("terrain.bin truncated"); return false; }
        memcpy(&nh[(size_t)k * 1089], r.p, 1089 * 2); r.p += 1089 * 2; undelta(&nh[(size_t)k * 1089]);
        memcpy(&nlc[(size_t)k * 4096], r.p, 4096); r.p += 4096;
    }
    for (uint32_t k = 0; k < nFar; k++) {
        if (r.p + 1089 * 2 + 1024 > r.e) { LOGE("terrain.bin truncated"); return false; }
        memcpy(&fh[(size_t)k * 1089], r.p, 1089 * 2); r.p += 1089 * 2; undelta(&fh[(size_t)k * 1089]);
        memcpy(&flc[(size_t)k * 1024], r.p, 1024); r.p += 1024;
    }
    LOGI("terrain: %u near tiles, %u far tiles", nNear, nFar);
    return true;
}
float Terrain::nodeNear(int i, int j, bool& ok) const {
    if (i < 0 || j < 0) { ok = false; return 0; }
    int jx = i >> 5, b = i & 31, jn = j >> 5, a = j & 31;
    if (!hasNear(jx, jn)) {
        if (b == 0 && hasNear(jx - 1, jn)) { jx--; b = 32; }
        else if (a == 0 && hasNear(jx, jn - 1)) { jn--; a = 32; }
        else if (a == 0 && b == 0 && hasNear(jx - 1, jn - 1)) { jx--; jn--; a = 32; b = 32; }
        else { ok = false; return 0; }
    }
    return nh[(size_t)ndir[jn * nx + jx] * 1089 + a * 33 + b] / 16.f - 64.f;
}
float Terrain::nodeFar(int i, int j) const {
    if (i < 0) i = 0; if (j < 0) j = 0;
    int jx = i >> 5, b = i & 31, jn = j >> 5, a = j & 31;
    if (!hasFar(jx, jn)) {
        if (b == 0 && hasFar(jx - 1, jn)) { jx--; b = 32; }
        else if (a == 0 && hasFar(jx, jn - 1)) { jn--; a = 32; }
        else if (a == 0 && b == 0 && hasFar(jx - 1, jn - 1)) { jx--; jn--; a = 32; b = 32; }
        else return 0;
    }
    return fh[(size_t)fdir[jn * fx + jx] * 1089 + a * 33 + b] / 16.f - 64.f;
}
float Terrain::demFar(double x, double n) const {
    double gx = (x - X0 - 16) / 128, gn = (n - N0 - 16) / 128; int i = (int)floor(gx), j = (int)floor(gn); float u = (float)(gx - i), v = (float)(gn - j);
    return lerpf(lerpf(nodeFar(i, j), nodeFar(i + 1, j), u), lerpf(nodeFar(i, j + 1), nodeFar(i + 1, j + 1), u), v);
}
float Terrain::dem(double x, double n) const {
    double gx = (x - X0 - 16) / 32, gn = (n - N0 - 16) / 32; int i = (int)floor(gx), j = (int)floor(gn); float u = (float)(gx - i), v = (float)(gn - j);
    bool ok = true;
    float a = nodeNear(i, j, ok), b = nodeNear(i + 1, j, ok), c = nodeNear(i, j + 1, ok), d = nodeNear(i + 1, j + 1, ok);
    if (!ok) return demFar(x, n);
    return lerpf(lerpf(a, b, u), lerpf(c, d, u), v);
}
int Terrain::lcFar(double x, double n) const {
    int ci = (int)floor((x - X0) / 128), cj = (int)floor((n - N0) / 128);
    int jx = ci >> 5, jn = cj >> 5;
    if (!hasFar(jx, jn)) return LC_WATER;
    return flc[(size_t)fdir[jn * fx + jx] * 1024 + (cj & 31) * 32 + (ci & 31)];
}
int Terrain::lc(double x, double n) const {
    int ci = (int)floor((x - X0) / 16), cj = (int)floor((n - N0) / 16);
    int jx = ci >> 6, jn = cj >> 6;
    if (!hasNear(jx, jn)) return lcFar(x, n);
    return nlc[(size_t)ndir[jn * nx + jx] * 4096 + (cj & 63) * 64 + (ci & 63)];
}

bool WorldData::load() {
    if (!route.load() || !terr.load()) return false;
    std::vector<uint8_t> raw;
    if (!readAssetZ("buildings.bin", raw)) return false;
    {
        Rd r{raw.data(), raw.data() + raw.size()};
        r.p += 4; bX0 = r.get<double>(); bN0 = r.get<double>(); bT = r.get<float>(); bnx = (int)r.get<uint32_t>(); bnn = (int)r.get<uint32_t>();
        uint32_t n = r.get<uint32_t>();
        r.arr(bdir, (size_t)bnx * bnn * 2); r.arr(bld, n);
        LOGI("buildings: %u", n);
    }
    if (!readAssetZ("roads.bin", raw)) return false;
    {
        Rd r{raw.data(), raw.data() + raw.size()};
        r.p += 4; rX0 = r.get<double>(); rN0 = r.get<double>(); rT = r.get<float>(); rnx = (int)r.get<uint32_t>(); rnn = (int)r.get<uint32_t>();
        uint32_t n = r.get<uint32_t>();
        r.arr(rdir, (size_t)rnx * rnn * 2); r.arr(roff, n);
        rbody.assign(r.p, r.e);
        LOGI("roads: %u polylines", n);
    }
    return true;
}

// Cut / fill the raw terrain so the road platform sits on it: flat under the road, 1:1.8 embankments, 1:1.25 cuttings,
// a trench under bridges and a cover over tunnels.
float WorldData::carve(float dem, const RouteProj& p) const {
    const Route& R = route; int i = p.i; float u = p.u;
    auto L = [&](const std::vector<float>& a) { return a[i] + (a[i + 1] - a[i]) * u; };
    float g = L(R.y), eL = L(R.extL), eR = L(R.extR), wb = L(R.wBridge), wt = L(R.wTunnel);
    float q = p.lat > 0 ? p.lat - eR : -p.lat - eL;      // distance outside the platform edge
    float T;
    if (q <= 0) T = g - 0.6f;                               // under the pavement
    else {
        float verge = g - 0.15f * std::min(q, 2.f), qq = std::max(q - 2.f, 0.f);
        T = clampf(dem, verge - qq / 1.8f, verge + qq / 1.25f);
    }
    float qo = std::max(q, 0.f);
    if (wb > 0) { float Tb = std::min(dem, g - 6.0f + qo / 1.3f); T = lerpf(T, Tb, wb); }
    if (wt > 0) { float Tt = std::max(dem, g + 10.5f - qo * 0.9f); T = lerpf(T, Tt, wt); }
    return T;
}
float WorldData::ground(double X, double Z, RouteProj* rp) const {
    float h = terr.dem(X, -Z);
    RouteProj p;
    if (!route.project(X, Z, 320.f, p)) { if (rp) rp->dist = 1e9f; return h; }
    if (rp) *rp = p;
    return carve(h, p);
}

void lcWeights(int lc, float w[6]) {
    w[0] = w[1] = w[2] = w[3] = w[4] = w[5] = 0;
    switch (lc) {
        case LC_TREE: w[1] = 1; break;
        case LC_SHRUB: w[0] = 0.6f; w[1] = 0.4f; break;
        case LC_GRASS: w[0] = 1; break;
        case LC_CROP: w[2] = 1; break;
        case LC_BUILT: w[3] = 1; break;
        case LC_BARE: w[0] = 0.3f; w[5] = 0.7f; break;
        case LC_WATER: w[4] = 1; break;
        default: w[0] = 1; break;
    }
}
