// Road corridor chunk: route-aligned terrain strip, pavement, barriers, tunnels, bridges, lamps.
#include "world.h"

TVtx makeTVtx(const Vec3& p, const Vec3& n, const float w[6]);

struct Sec {
    int i; double s; Vec3 c, fwd, right;
    float g, W, eL, eR, limL, limR, wb, wt; int kind, lanes; uint16_t flags;
    Vec3 P(float l, float h) const { return c + right * l + Vec3(0, h, 0); }
};
struct P2 { float l, h; };

void addBill(BillMeshData& m, const Vec3& p, float hw, float h0, float h1, float u0, float v0, float u1, float v1, uint32_t rgba) {
    uint32_t b = (uint32_t)m.v.size();
    auto push = [&](float ox, float oy, float u, float v) {
        BVtx t; t.px = p.x; t.py = p.y; t.pz = p.z; t.ox = ox; t.oy = oy; t.u = u; t.v = v;
        t.r = (rgba >> 24) & 255; t.g = (rgba >> 16) & 255; t.b = (rgba >> 8) & 255; t.a = rgba & 255; m.v.push_back(t);
    };
    push(-hw, h0, u0, v1); push(hw, h0, u1, v1); push(hw, h1, u1, v0); push(-hw, h1, u0, v0);
    m.i.push_back(b); m.i.push_back(b + 1); m.i.push_back(b + 2); m.i.push_back(b); m.i.push_back(b + 2); m.i.push_back(b + 3);
}
void addGlow(BillMeshData& m, const Vec3& p, float size, int hex, int a = 255) {
    addBill(m, p, size, -size, size, -1, -1, 1, 1, ((uint32_t)hex << 8) | (uint32_t)a);
}

static const float QS[] = {0.001f, 2, 4.5f, 8, 13, 20, 30, 44, 62, 86, 120};
static const int NQ = 11;

// ribbon between lateral/height curves A (left) and B (right): faces up when A is left of B
template <class FA, class FB, class OK>
static void ribbon(MeshData& m, const std::vector<Sec>& S, FA fa, FB fb, OK ok, float vScale = 1.f) {
    for (size_t j = 0; j + 1 < S.size(); j++) {
        if (!ok(S[j]) || !ok(S[j + 1])) continue;
        P2 a0 = fa(S[j]), b0 = fb(S[j]), a1 = fa(S[j + 1]), b1 = fb(S[j + 1]);
        float v0 = (float)(S[j].s) * vScale, v1 = (float)(S[j + 1].s) * vScale;
        Vec3 A = S[j].P(a0.l, a0.h), B = S[j].P(b0.l, b0.h), C = S[j + 1].P(b1.l, b1.h), D = S[j + 1].P(a1.l, a1.h);
        Vec3 n = normalize(cross(B - A, D - A));
        uint32_t i0 = m.vert(A, n, 0, v0); m.vert(B, n, 1, v0); m.vert(C, n, 1, v1); m.vert(D, n, 0, v1);
        m.tri(i0, i0 + 1, i0 + 2); m.tri(i0, i0 + 2, i0 + 3);
    }
}
// extrude an open profile (clockwise seen looking forward => outward normals) anchored at lateral anchor(sec)
template <class FA, class OK>
static void extrude(MeshData& m, const std::vector<Sec>& S, const P2* prof, int np, FA anchor, OK ok) {
    for (int k = 0; k + 1 < np; k++) {
        P2 p0 = prof[k], p1 = prof[k + 1];
        ribbon(m, S, [&](const Sec& s) { return P2{anchor(s) + p0.l, s.g + p0.h}; }, [&](const Sec& s) { return P2{anchor(s) + p1.l, s.g + p1.h}; }, ok);
    }
}
// pavement ribbon with lane-space u coordinates (road shader)
template <class OK>
static void pave(MeshData& m, const std::vector<Sec>& S, std::function<void(const Sec&, float&, float&, float&, float&)> span, int style, OK ok, double s0, float lift = 0.f) {
    for (size_t j = 0; j + 1 < S.size(); j++) {
        if (!ok(S[j]) || !ok(S[j + 1])) continue;
        uint32_t base = (uint32_t)m.v.size();
        for (int e = 0; e < 2; e++) {
            const Sec& s = S[j + e]; float la, lb, ua, ub; span(s, la, lb, ua, ub);
            int fl = ((s.flags & RF_BUSLANE) ? 1 : 0) | ((s.flags & RF_LIT) ? 2 : 0) | ((s.flags & RF_TUNNEL) ? 4 : 0);
            m.cr = (uint8_t)s.lanes; m.cg = (uint8_t)style; m.cb = (uint8_t)fl; m.ca = 255; m.layer = s.W;
            float v = (float)(s.s - s0);
            m.vert(s.P(la, s.g + lift), Vec3(0, 1, 0), ua, v); m.vert(s.P(lb, s.g + lift), Vec3(0, 1, 0), ub, v);
        }
        m.tri(base, base + 1, base + 3); m.tri(base, base + 3, base + 2);
    }
}

void World::genRoad(int ci, int lod, ChunkData& out) {
    const Route& R = d.route;
    int i0 = ci * 40, i1 = std::min(i0 + 40, R.N - 2);
    if (i0 >= R.N - 2) return;
    int stride = 4;
    for (int i = i0; i <= i1; i++) {
        if (R.kind[i] != RK_EXP) stride = 1;
        else if (fabsf(R.curv[i]) > 1.f / 1500.f || (R.flags[i] & (RF_REST | RF_TOLL))) stride = std::min(stride, 2);
    }
    if (lod >= 2) stride = std::max(stride, 4);
    int mid = (i0 + i1) / 2;
    out.origin = Vec3d(R.x[mid], R.y[mid], R.z[mid]);
    std::vector<Sec> S;
    for (int i = i0; i <= i1; i += stride) {
        Sec s; s.i = i; s.s = (double)i * R.step;
        int a = std::max(i - 1, 0), b = std::min(i + 1, R.N - 1);
        s.fwd = normalize(Vec3((float)(R.x[b] - R.x[a]), 0, (float)(R.z[b] - R.z[a]))); s.right = Vec3(-s.fwd.z, 0, s.fwd.x);
        s.c = Vec3((float)(R.x[i] - out.origin.x), 0, (float)(R.z[i] - out.origin.z));
        s.g = R.y[i] - (float)out.origin.y; s.W = R.W[i]; s.eL = R.extL[i]; s.eR = R.extR[i]; s.limL = R.limL[i]; s.limR = R.limR[i];
        s.wb = R.wBridge[i]; s.wt = R.wTunnel[i]; s.kind = R.kind[i]; s.lanes = R.lanes[i]; s.flags = R.flags[i];
        S.push_back(s);
    }
    int ns = (int)S.size();
    float rad = 0;
    for (auto& s : S) rad = std::max(rad, length(s.c) + std::max(s.eL, s.eR) + 130.f);
    out.radius = rad;
    double s0 = (double)i0 * R.step;

    // ------------------------------------------------ terrain strip
    {
        const int NL = NQ * 2 + 3;                      // left outer..edge, 3 interior, right edge..outer
        std::vector<Vec3> pos(ns * NL); std::vector<float> wts(ns * NL * 6); std::vector<uint8_t> interior(ns, 0);
        for (int j = 0; j < ns; j++) {
            const Sec& s = S[j];
            interior[j] = (s.wt > 0.999f) ? 1 : (s.wb > 0.5f ? 2 : 0);
            for (int k = 0; k < NL; k++) {
                float l, q;
                if (k < NQ) { q = std::min(QS[NQ - 1 - k], s.limL); l = -(s.eL + q); }
                else if (k < NQ + 3) { q = -1; l = lerpf(-s.eL, s.eR, (k - NQ + 1) / 4.f); }
                else { q = std::min(QS[k - NQ - 3], s.limR); l = s.eR + q; }
                Vec3 p = s.P(l, 0);
                double X = out.origin.x + p.x, Z = out.origin.z + p.z;
                RouteProj rp; rp.i = std::min(s.i, R.N - 2); rp.u = 0; rp.lat = l; rp.dist = fabsf(l);
                float dem = d.terr.dem(X, -Z);
                float h = d.carve(dem, rp);
                p.y = h - (float)out.origin.y;
                pos[j * NL + k] = p;
                float* w = &wts[(j * NL + k) * 6];
                lcWeights(d.terr.lc(X, -Z), w);
                if (q >= 0 && q < 26 && s.wt < 0.5f) {             // verge: mown grass, or paved in town
                    float f = 1.f - sstep(12, 26, q);
                    float verge[6] = {1, 0, 0, 0, 0, 0};
                    if (s.kind == RK_CITY || s.kind == RK_LOT) { verge[0] = 0; verge[3] = 1; }
                    for (int c = 0; c < 6; c++) w[c] = lerpf(w[c], verge[c], f);
                    if (dem - h > 5.f && q > 3) w[5] = std::max(w[5], sat((dem - h - 5.f) / 6.f) * 0.8f);   // rock cut
                }
            }
        }
        auto& V = out.terrain.v; auto& I = out.terrain.i;
        for (int j = 0; j < ns; j++) for (int k = 0; k < NL; k++) {
            int ja = std::max(j - 1, 0), jb = std::min(j + 1, ns - 1), ka = std::max(k - 1, 0), kb = std::min(k + 1, NL - 1);
            Vec3 dl = pos[j * NL + kb] - pos[j * NL + ka], df = pos[jb * NL + k] - pos[ja * NL + k];
            Vec3 n = normalize(cross(dl, df)); if (n.y < 0) n = -n;
            if (length(dl) < 1e-3f || length(df) < 1e-3f) n = Vec3(0, 1, 0);
            V.push_back(makeTVtx(pos[j * NL + k], n, &wts[(j * NL + k) * 6]));
        }
        for (int j = 0; j + 1 < ns; j++) for (int k = 0; k + 1 < NL; k++) {
            bool inner = (k >= NQ - 1 && k < NQ + 3);
            if (inner && !(interior[j] && interior[j + 1] && interior[j] == interior[j + 1])) continue;
            uint32_t a = j * NL + k, b = a + 1, c = a + NL + 1, e = a + NL;
            I.push_back(a); I.push_back(b); I.push_back(c); I.push_back(a); I.push_back(c); I.push_back(e);
        }
        // outer skirts
        for (int side = 0; side < 2; side++) {
            int k = side ? NL - 1 : 0; uint32_t base = (uint32_t)V.size();
            for (int j = 0; j < ns; j++) { TVtx t = V[j * NL + k]; V.push_back(t); t.py -= 6.f; V.push_back(t); }
            for (int j = 0; j + 1 < ns; j++) {
                uint32_t p = base + j * 2;
                if (side) { I.push_back(p); I.push_back(p + 1); I.push_back(p + 3); I.push_back(p); I.push_back(p + 3); I.push_back(p + 2); }
                else { I.push_back(p); I.push_back(p + 3); I.push_back(p + 1); I.push_back(p); I.push_back(p + 2); I.push_back(p + 3); }
            }
        }
    }

    // ------------------------------------------------ pavement
    auto isExp = [](const Sec& s) { return s.kind == RK_EXP; };
    auto expOpen = [](const Sec& s) { return s.kind == RK_EXP && !(s.flags & RF_TUNNEL); };
    auto expTun = [](const Sec& s) { return s.kind == RK_EXP && (s.flags & RF_TUNNEL); };
    MeshData& rd = out.road;
    // our carriageway (in tunnels it stops at the tube wall)
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) {
        la = -s.W / 2 - 1.0f; lb = (s.flags & RF_TUNNEL) ? s.W / 2 + 2.0f : s.eR; ua = la + s.W / 2; ub = lb + s.W / 2; }, 0, isExp, s0);
    // opposite carriageway + median strip
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) {
        la = -s.eL; lb = -s.W / 2 - 2.2f; ua = s.eL - s.W / 2 - 3.2f; ub = -1.0f; }, 0, expOpen, s0);
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) {
        la = -s.W / 2 - 2.2f; lb = -s.W / 2 - 1.0f; ua = 0; ub = 1.2f; }, 4, expOpen, s0);
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) { la = -s.eL; lb = s.eR; ua = la; ub = lb; }, 1,
         [](const Sec& s) { return s.kind == RK_RAMP; }, s0);
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) { la = -s.lanes * 3.3f; lb = s.lanes * 3.3f; ua = la; ub = lb; }, 2,
         [](const Sec& s) { return s.kind == RK_CITY; }, s0);
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) { la = -s.eL; lb = s.eR; ua = la; ub = lb; }, 3,
         [](const Sec& s) { return s.kind == RK_LOT; }, s0);
    // sidewalks in town (raised kerb)
    auto city = [](const Sec& s) { return s.kind == RK_CITY; };
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) { la = -s.eL; lb = -s.lanes * 3.3f; ua = la; ub = lb; }, 5, city, s0, 0.16f);
    pave(rd, S, [](const Sec& s, float& la, float& lb, float& ua, float& ub) { la = s.lanes * 3.3f; lb = s.eR; ua = la; ub = lb; }, 5, city, s0, 0.16f);
    MeshData& L = out.lit;
    L.mat = MAT_LIT; L.layer = -1;
    L.color(0x9a978f);
    ribbon(L, S, [](const Sec& s) { return P2{-s.lanes * 3.3f, s.g}; }, [](const Sec& s) { return P2{-s.lanes * 3.3f, s.g + 0.16f}; }, city);   // kerb faces
    ribbon(L, S, [](const Sec& s) { return P2{s.lanes * 3.3f, s.g + 0.16f}; }, [](const Sec& s) { return P2{s.lanes * 3.3f, s.g}; }, city);
    if (lod >= 2) return;

    // ------------------------------------------------ barriers / guardrails
    auto open = [](const Sec& s) { return s.kind == RK_EXP && !(s.flags & (RF_TUNNEL | RF_BRIDGE | RF_TOLL)); };
    static const P2 median[] = {{-0.30f, 0}, {-0.11f, 0.25f}, {-0.08f, 0.81f}, {0.08f, 0.81f}, {0.11f, 0.25f}, {0.30f, 0}};
    L.color(0xb7b4ab);
    extrude(L, S, median, 6, [](const Sec& s) { return -s.W / 2 - 1.6f; }, [](const Sec& s) { return s.kind == RK_EXP && !(s.flags & (RF_TUNNEL | RF_TOLL)); });
    // W-beam guardrails (face the traffic)
    static const P2 railR[] = {{0, 0.42f}, {-0.05f, 0.52f}, {0, 0.60f}, {-0.05f, 0.68f}, {0, 0.78f}};
    static const P2 railL[] = {{0, 0.78f}, {0.05f, 0.68f}, {0, 0.60f}, {0.05f, 0.52f}, {0, 0.42f}};
    auto railOkR = [](const Sec& s) { return s.kind == RK_EXP && !(s.flags & (RF_TUNNEL | RF_BRIDGE | RF_TOLL | RF_BARR | RF_REST)); };
    auto railOkL = [](const Sec& s) { return s.kind == RK_EXP && !(s.flags & (RF_TUNNEL | RF_BRIDGE | RF_TOLL | RF_BARL)); };
    L.color(0xa4aaae);
    extrude(L, S, railR, 5, [](const Sec& s) { return s.eR - 0.35f; }, railOkR);
    extrude(L, S, railL, 5, [](const Sec& s) { return -s.eL + 0.35f; }, railOkL);
    auto ramp = [](const Sec& s) { return s.kind == RK_RAMP && !(s.flags & RF_BRIDGE); };
    extrude(L, S, railR, 5, [](const Sec& s) { return s.eR - 0.35f; }, ramp);
    extrude(L, S, railL, 5, [](const Sec& s) { return -s.eL + 0.35f; }, ramp);
    if (lod == 0) {     // posts
        L.color(0x7f858a);
        for (int j = 0; j < ns; j++) {
            const Sec& s = S[j]; Mat4 M = Mat4::basis(s.right, Vec3(0, 1, 0), -s.fwd, s.c + Vec3(0, s.g, 0));
            if (railOkR(s) || ramp(s)) L.box(M, Vec3(s.eR - 0.33f, 0, -0.05f), Vec3(s.eR - 0.23f, 0.74f, 0.05f), 1 | 2 | 16 | 32);
            if (railOkL(s) || ramp(s)) L.box(M, Vec3(-s.eL + 0.23f, 0, -0.05f), Vec3(-s.eL + 0.33f, 0.74f, 0.05f), 1 | 2 | 16 | 32);
        }
    }
    // bridge parapets + deck fascia
    static const P2 parR[] = {{-0.45f, 0}, {-0.30f, 1.0f}, {-0.05f, 1.0f}, {0, -1.9f}};
    static const P2 parL[] = {{0, -1.9f}, {0.05f, 1.0f}, {0.30f, 1.0f}, {0.45f, 0}};
    auto brg = [](const Sec& s) { return (s.flags & RF_BRIDGE) && !(s.flags & RF_TUNNEL) && s.kind != RK_CITY && s.kind != RK_LOT; };
    L.color(0xb2afa6);
    extrude(L, S, parR, 4, [](const Sec& s) { return s.eR; }, brg);
    extrude(L, S, parL, 4, [](const Sec& s) { return -s.eL; }, brg);
    // underside of the deck + piers
    L.color(0x8d8a83);
    ribbon(L, S, [](const Sec& s) { return P2{s.eR, s.g - 1.9f}; }, [](const Sec& s) { return P2{-s.eL, s.g - 1.9f}; }, brg);
    for (int j = 0; j < ns; j++) {
        const Sec& s = S[j];
        if (!brg(s) || s.wb < 0.999f || (s.i % 8) != 0) continue;
        double X = out.origin.x + s.c.x, Z = out.origin.z + s.c.z;
        float gh = d.terr.dem(X, -Z) - (float)out.origin.y;
        if (s.g - gh < 6.f) continue;
        Mat4 M = Mat4::basis(s.right, Vec3(0, 1, 0), -s.fwd, s.c);
        float span = s.eR + s.eL;
        for (int k = 0; k < 2; k++) { float l = -s.eL + span * (k ? 0.75f : 0.25f); L.box(M, Vec3(l - 1.1f, gh - 2, -0.9f), Vec3(l + 1.1f, s.g - 1.9f, 0.9f), 1 | 2 | 16 | 32); }
        L.box(M, Vec3(-s.eL + 1, s.g - 3.2f, -1.1f), Vec3(s.eR - 1, s.g - 1.9f, 1.1f), 63 & ~4);
    }

    // ------------------------------------------------ noise barriers
    {
        auto barR = [](const Sec& s) { return s.kind == RK_EXP && (s.flags & RF_BARR) && !(s.flags & (RF_TUNNEL | RF_BRIDGE | RF_TOLL | RF_REST)); };
        auto barL = [](const Sec& s) { return s.kind == RK_EXP && (s.flags & RF_BARL) && !(s.flags & (RF_TUNNEL | RF_BRIDGE | RF_TOLL)); };
        static const int cols[] = {0x9db7a6, 0xc9c3b1, 0xa9b9c4, 0xb9c4ae};
        for (size_t j = 0; j + 1 < S.size(); j++) {
            std::vector<Sec> two = {S[j], S[j + 1]};
            int c = cols[hash32((uint32_t)(S[j].i / 16)) & 3];
            L.color(c);
            ribbon(L, two, [](const Sec& s) { return P2{s.eR + 0.9f, s.g - 0.2f}; }, [](const Sec& s) { return P2{s.eR + 0.9f, s.g + 2.3f}; }, barR);
            ribbon(L, two, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g + 2.3f}; }, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g - 0.2f}; }, barL);
        }
        L.color(0x6f7a80);
        ribbon(L, S, [](const Sec& s) { return P2{s.eR + 0.9f, s.g + 2.3f}; }, [](const Sec& s) { return P2{s.eR + 0.9f, s.g + 2.45f}; }, barR);
        ribbon(L, S, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g + 2.45f}; }, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g + 2.3f}; }, barL);
        MeshData& G = out.glass; G.mat = MAT_LIT; G.layer = -1; G.color(0xbfd6dc, 70);
        ribbon(G, S, [](const Sec& s) { return P2{s.eR + 0.9f, s.g + 2.45f}; }, [](const Sec& s) { return P2{s.eR + 0.9f, s.g + 4.6f}; }, barR);
        ribbon(G, S, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g + 4.6f}; }, [](const Sec& s) { return P2{-s.eL - 0.9f, s.g + 2.45f}; }, barL);
        if (lod == 0) {
            L.color(0x5f6a70);
            for (int j = 0; j < ns; j++) {
                const Sec& s = S[j]; Mat4 M = Mat4::basis(s.right, Vec3(0, 1, 0), -s.fwd, s.c + Vec3(0, s.g, 0));
                if (barR(s)) L.box(M, Vec3(s.eR + 0.78f, -0.2f, -0.08f), Vec3(s.eR + 0.92f, 4.7f, 0.08f), 2 | 16 | 32);
                if (barL(s)) L.box(M, Vec3(-s.eL - 0.92f, -0.2f, -0.08f), Vec3(-s.eL - 0.78f, 4.7f, 0.08f), 1 | 16 | 32);
            }
        }
    }

    // ------------------------------------------------ tunnel tube
    {
        const int NA = 9; P2 tube[NA + 4];
        auto tubeProf = [&](const Sec& s, P2* p) {
            float lA = -s.W / 2 - 1.3f, lB = s.W / 2 + 2.0f, lc = (lA + lB) / 2, hw = (lB - lA) / 2; int n = 0;
            p[n++] = P2{lB, 0};
            for (int k = 0; k <= NA; k++) { float th = (float)k / NA * PI; p[n++] = P2{lc + hw * cosf(th), 2.8f + 4.2f * sinf(th)}; }
            p[n++] = P2{lA, 0};
            return n;
        };
        L.mat = MAT_TUNNEL;
        for (size_t j = 0; j + 1 < S.size(); j++) {
            if (!expTun(S[j]) || !expTun(S[j + 1])) continue;
            P2 pa[NA + 4], pb[NA + 4]; int n = tubeProf(S[j], pa); tubeProf(S[j + 1], pb);
            for (int k = 0; k + 1 < n; k++) {
                bool wall = (k == 0 || k == n - 2);
                L.color(wall ? 0xdcd9cc : 0x9c988c);
                Vec3 A = S[j].P(pa[k].l, S[j].g + pa[k].h), B = S[j].P(pa[k + 1].l, S[j].g + pa[k + 1].h);
                Vec3 C = S[j + 1].P(pb[k + 1].l, S[j + 1].g + pb[k + 1].h), D = S[j + 1].P(pb[k].l, S[j + 1].g + pb[k].h);
                L.quad(A, B, C, D);
            }
            // lamps: two rows on the crown
            if ((S[j].i % 2) == 0 || stride >= 2) {
                L.mat = MAT_EMIT; L.color(0xfff1c8);
                float lA = -S[j].W / 2 - 1.3f, lB = S[j].W / 2 + 2.0f, lc = (lA + lB) / 2, hw = (lB - lA) / 2;
                for (int r = -1; r <= 1; r += 2) {
                    float l = lc + r * hw * 0.42f, h = S[j].g + 2.8f + 4.2f * sinf(acosf(0.42f)) - 0.12f;
                    Vec3 m0 = S[j].P(l, h) + S[j].fwd * 1.0f, m1 = m0 + S[j].fwd * 1.6f;
                    L.quad(m0 + S[j].right * 0.22f, m0 - S[j].right * 0.22f, m1 - S[j].right * 0.22f, m1 + S[j].right * 0.22f);
                }
                L.mat = MAT_TUNNEL;
            }
        }
        // portals
        for (int j = 0; j < ns; j++) {
            const Sec& s = S[j];
            bool tun = (s.flags & RF_TUNNEL) != 0;
            bool prevT = s.i >= stride && (R.flags[s.i - stride] & RF_TUNNEL), nextT = s.i + stride < R.N && (R.flags[s.i + stride] & RF_TUNNEL);
            if (!tun || s.kind != RK_EXP || (prevT && nextT)) continue;
            bool entry = !prevT;
            // how high does the hillside stand over the mouth?
            float top = s.g + 11.f;
            for (float l = -s.eL - 12; l <= s.eR + 12; l += 4) {
                Vec3 p = s.P(l, 0); float hh = d.terr.dem(out.origin.x + p.x, -(out.origin.z + p.z)) - (float)out.origin.y;
                if (l > -s.eL - 2 && l < s.eR + 2) top = std::max(top, std::min(hh + 0.8f, s.g + 60.f));
            }
            L.mat = MAT_LIT;
            auto wq = [&](float l0, float h0, float l1, float h1) {
                L.color(h0 > s.g + 9.5f ? 0x8b9382 : 0xc2beb2);
                Vec3 a = s.P(l0, h0), b = s.P(l1, h0), c = s.P(l1, h1), e = s.P(l0, h1);
                if (entry) L.quad(a, b, c, e); else L.quad(b, a, e, c);
            };
            float lA = -s.W / 2 - 1.3f, lB = s.W / 2 + 2.0f, oB = -s.W / 2 - 1.9f, oA = -s.eL + 1.0f;
            float x0 = -s.eL - 16, x1 = s.eR + 16;
            wq(x0, s.g - 1, oA, s.g + 9.5f); wq(oB, s.g - 1, lA, s.g + 9.5f); wq(lB, s.g - 1, x1, s.g + 9.5f);
            wq(x0, s.g + 9.5f, x1, top);
            for (int tb = 0; tb < 2; tb++) {       // spandrels over each arch
                float a = tb ? oA : lA, b = tb ? oB : lB, lc = (a + b) / 2, hw = (b - a) / 2;
                for (int k = 0; k < NA; k++) {
                    float t0 = (float)k / NA * PI, t1 = (float)(k + 1) / NA * PI;
                    float l0 = lc + hw * cosf(t1), l1 = lc + hw * cosf(t0), h0 = s.g + 2.8f + 4.2f * sinf(t1), h1 = s.g + 2.8f + 4.2f * sinf(t0);
                    L.color(0xc2beb2);
                    Vec3 A = s.P(l0, h0), B = s.P(l1, h1), C = s.P(l1, s.g + 9.5f), D = s.P(l0, s.g + 9.5f);
                    if (entry) L.quad(A, B, C, D); else L.quad(B, A, D, C);
                }
                // the dark throat of the opposite tube (we never drive through it)
                if (tb == 1) {
                    L.color(0x1a1a18);
                    Vec3 off = s.fwd * (entry ? 3.f : -3.f);
                    Vec3 a2 = s.P(a, s.g) + off, b2 = s.P(b, s.g) + off, c2 = s.P(b, s.g + 7.2f) + off, d2 = s.P(a, s.g + 7.2f) + off;
                    if (entry) L.quad(a2, b2, c2, d2); else L.quad(b2, a2, d2, c2);
                }
            }
        }
        L.mat = MAT_LIT;
    }

    // ------------------------------------------------ lamps
    {
        for (int j = 0; j < ns; j++) {
            const Sec& s = S[j];
            if (!(s.flags & RF_LIT) || (s.flags & RF_TUNNEL) || s.kind == RK_LOT) continue;
            int period = s.kind == RK_EXP ? 8 : 6;
            if (s.i % period != 0) continue;
            for (int side = 0; side < 2; side++) {
                if (s.kind == RK_EXP && ((s.i / period + side) & 1)) continue;            // staggered on the expressway
                float l = s.kind == RK_CITY ? (side ? -(s.lanes * 3.3f + 0.7f) : s.lanes * 3.3f + 0.7f) : (side ? -s.eL - 0.8f : s.eR + 0.8f);
                if (s.kind == RK_EXP && ((side == 0 && (s.flags & (RF_BARR | RF_REST))) || (side == 1 && (s.flags & RF_BARL)))) l += side ? -0.9f : 0.9f;
                float hgt = s.kind == RK_EXP ? 11.f : 8.5f, arm = s.kind == RK_EXP ? 2.4f : 1.8f;
                float dir = side ? 1.f : -1.f;
                Vec3 base = s.P(l, s.g), top = s.P(l, s.g + hgt), head = s.P(l + dir * arm, s.g + hgt + 0.25f);
                if (lod == 0) {
                    L.mat = MAT_LIT; L.color(0x858b90);
                    L.cylinder(Mat4::identity(), base, top, 0.11f, 0.07f, 6, false);
                    L.cylinder(Mat4::identity(), top, head, 0.06f, 0.05f, 5, false);
                } else {
                    L.mat = MAT_LIT; L.color(0x858b90);
                    L.quad(base - s.fwd * 0.1f, base + s.fwd * 0.1f, top + s.fwd * 0.07f, top - s.fwd * 0.07f);
                    L.quad(base + s.fwd * 0.1f, base - s.fwd * 0.1f, top - s.fwd * 0.07f, top + s.fwd * 0.07f);
                }
                L.mat = MAT_NIGHTLAMP; L.color(0xfff0cf);
                Vec3 hc = head + Vec3(0, -0.08f, 0);
                L.quad(hc - s.fwd * 0.35f + s.right * 0.16f, hc - s.fwd * 0.35f - s.right * 0.16f, hc + s.fwd * 0.35f - s.right * 0.16f, hc + s.fwd * 0.35f + s.right * 0.16f);
                L.mat = MAT_LIT;
                addGlow(out.glow, hc, 1.5f, 0xffd9a0);
            }
        }
    }
    genSigns(i0, i1, lod, out);
    genSetPieces(i0, i1, lod, out);
}
