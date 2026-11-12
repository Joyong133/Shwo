// Other vehicles on the road, and the traffic signals in town.
#include "app.h"

void addGlow(BillMeshData& m, const Vec3& p, float size, int hex, int a);

static const int kCarTints[] = {0xf2f2f0, 0xf2f2f0, 0xf2f2f0, 0xe9e9e6, 0x18181a, 0x1c1d20, 0x8a8d90, 0x6f7377, 0xc4c6c8, 0xb9bcc0, 0x2a4f8c, 0x9c2a2a, 0x3d4a3c, 0x5a3a2a};
static const int kTruckTints[] = {0xf0f0ee, 0x2c62a8, 0x2c62a8, 0xe8e8e4, 0x27507a, 0x8a2f2a, 0x2f6b45, 0x9a9da0};

void App::initTraffic() {
    for (int t = 0; t < VEH_COUNT; t++) { MeshData m; buildVehicle(t, m, vehInfo[t]); vehMesh[t].upload(m); }
}

static float laneLat(const Route& R, double s, int lane, int dir) {
    int i = R.idx(s); float W = R.W[i];
    if (R.kind[i] == RK_EXP) return dir > 0 ? -W / 2 + (lane - 0.5f) * 3.6f : -(W / 2 + 3.2f + (lane - 0.5f) * 3.6f);
    return dir > 0 ? (lane - 0.5f) * 3.3f : -(lane - 0.5f) * 3.3f;
}

void App::updateTraffic(double dt) {
    const Route& R = world.d.route;
    if (phase != PH_RIDE) { cars.clear(); return; }
    if (dt > 2.0) dt = 2.0;                       // fast-forward: do not let cars tunnel through each other
    int bi = R.idx(s); int kind = R.kind[bi]; int L = R.lanes[bi]; bool busLane = (R.flags[bi] & RF_BUSLANE) != 0;
    float busOff = R.attr(R.off, s);
    double hour = clockNow();
    float tod = (hour < 5 || hour >= 23) ? 0.3f : (hour >= 20 ? 0.6f : ((hour >= 7 && hour < 9.5) || (hour >= 17 && hour < 19.5) ? 1.25f : 1.f));
    float km = (float)(s / 1000.0);
    float dens = (km < 45 ? 15.f : (km < 95 ? 10.f : ((km > 135 && km < 158) || (km > 275 && km < 305) || km > 395 ? 10.f : 6.5f))) * tod;
    if (kind == RK_RAMP || kind == RK_LOT) dens = 0;
    if (kind == RK_CITY) dens = 9.f * tod;

    // ---- move
    for (Vehicle& c : cars) {
        int ci = R.idx(c.s);
        float slow = c.dir > 0 ? clampf(R.v[ci] / 30.f, 0.12f, 1.f) : 1.f;
        float v = c.want * slow;
        if (c.dir > 0 && R.kind[ci] == RK_CITY) {            // hold at a red light
            for (int k = 0; k < (int)R.stops.size(); k++) {
                if (R.stops[k].type != 0) continue;
                bool red = (k == nextStop && s > R.stops[k].s - 160.f) || (k == nextStop - 1 && dwellLeft > 1.5f);
                float d = R.stops[k].s - (float)c.s;
                if (red && d > -1.f && d < 30.f) v = std::min(v, std::max(0.f, (d - 3.f) * 0.5f));
            }
        }
        c.v += (v - c.v) * std::min(1.f, (float)dt * 0.8f);
    }
    // follow the car ahead
    for (Vehicle& c : cars) for (const Vehicle& o : cars) {
        if (&c == &o || o.dir != c.dir || o.lane != c.lane) continue;
        double gap = (o.s - c.s) * c.dir;
        if (gap > 0 && gap < 9.0 + c.v * 0.9 + vehInfo[o.type].length * 0.5) c.v = std::min(c.v, std::max(o.v - (float)(12.0 - std::min(gap, 12.0)) * 0.3f, 0.f));
    }
    for (Vehicle& c : cars) {
        c.s += c.v * dt * c.dir;
        c.lat = laneLat(R, c.s, c.lane, c.dir);
        // never share space with our own bus
        if (c.dir > 0 && fabsf(c.lat - busOff) < 2.9f) {
            double gap = 8.5 + vehInfo[c.type].length * 0.5, d = c.s - s;
            if (d >= 0 && d < gap) { c.s = s + gap; c.v = std::max(c.v, speed + 0.5f); }
            else if (d < 0 && d > -gap) { c.s = s - gap; c.v = std::min(c.v, speed); }
        }
    }
    // ---- retire
    cars.erase(std::remove_if(cars.begin(), cars.end(), [&](const Vehicle& c) {
        double d = c.s - s; int ci = R.idx(c.s);
        if (c.dir > 0) return d < -360 || d > 800 || (R.kind[ci] != RK_EXP && R.kind[ci] != RK_CITY);
        return d < -360 || d > 1650;
    }), cars.end());
    if (dens <= 0) return;
    // ---- spawn
    int same = 0, opp = 0;
    for (const Vehicle& c : cars) (c.dir > 0 ? same : opp)++;
    int lanesSame = std::max(L - (busLane ? 1 : 0), 1);
    int wantSame = (int)(dens * lanesSame * 1.0f), wantOpp = (int)(dens * L * 1.9f);
    if (kind == RK_CITY) { wantSame = (int)(dens * 2 * 0.5f); wantOpp = (int)(dens * 3 * 0.6f); }
    bool fill = cars.empty();
    for (int tries = 0; tries < (fill ? 200 : 3); tries++) {
        bool doSame = same < wantSame, doOpp = opp < wantOpp;
        if (!doSame && !doOpp) break;
        Vehicle c; c.dir = (doSame && (!doOpp || frand() < 0.5f)) ? 1 : -1;
        float r = frand();
        if (kind == RK_CITY) {
            c.lane = c.dir > 0 ? 2 + (int)(frand() * 1.99f) : 1 + (int)(frand() * 2.99f);
            c.type = r < 0.55f ? VEH_SEDAN : (r < 0.78f ? VEH_SUV : (r < 0.88f ? VEH_VAN : (r < 0.96f ? VEH_PORTER : VEH_BUS)));
            c.want = (38.f + 14.f * frand()) / 3.6f;
        } else {
            c.lane = (busLane ? 2 : 1) + (int)(frand() * (L - (busLane ? 1 : 0) - 0.01f));
            if (busLane && frand() < 0.05f) c.lane = 1;
            bool right = c.lane >= L - 1 && L >= 3;
            if (c.lane == 1 && busLane) { c.type = VEH_BUS; c.want = (104.f + 8.f * frand()) / 3.6f; }
            else if (right && r < 0.42f) { c.type = r < 0.16f ? VEH_PORTER : (r < 0.30f ? VEH_BOXTRUCK : (r < 0.38f ? VEH_TRAILER : VEH_BUS)); c.want = (82.f + 14.f * frand()) / 3.6f; }
            else { float q = frand(); c.type = q < 0.55f ? VEH_SEDAN : (q < 0.85f ? VEH_SUV : VEH_VAN); c.want = (98.f + 24.f * frand() + (c.lane <= 2 ? 6.f : 0.f)) / 3.6f; }
        }
        c.tint = (c.type >= VEH_PORTER && c.type != VEH_BUS) ? kTruckTints[(int)(frand() * 7.99f)] : (c.type == VEH_BUS ? 0xf4f4f2 : kCarTints[(int)(frand() * 13.99f)]);
        c.v = c.want;
        if (c.dir > 0) {
            if (fill) c.s = s - 300 + frand() * 1000;
            else if (c.want > speed + 0.8f) c.s = s - 330 - frand() * 25; else if (c.want < speed - 0.8f) c.s = s + 760 + frand() * 30; else continue;
        } else c.s = fill ? s - 300 + frand() * 1900 : s + 1600 + frand() * 40;
        if (c.s < 20 || c.s > R.length() - 20) continue;
        int ci = R.idx(c.s);
        if (R.kind[ci] != kind || R.lanes[ci] < c.lane) continue;
        c.lat = laneLat(R, c.s, c.lane, c.dir);
        if (c.dir > 0 && fabsf(c.lat - busOff) < 2.9f) {            // our own lane: nobody dawdles in front of the bus
            if (fabs(c.s - s) < 60 || c.type >= VEH_PORTER) continue;
            c.want = std::max(c.want, speed + 1.5f + 2.5f * frand()); c.v = c.want;
        }
        bool clear = true;
        for (const Vehicle& o : cars) if (o.dir == c.dir && o.lane == c.lane && fabs(o.s - c.s) < 34.0) { clear = false; break; }
        if (!clear) continue;
        cars.push_back(c); (c.dir > 0 ? same : opp)++;
    }
}

// convex outline of a handful of ground points (x,z), counter-clockwise seen from above
static void hullXZ(std::vector<Vec3>& p) {
    std::sort(p.begin(), p.end(), [](const Vec3& a, const Vec3& b) { return a.x < b.x || (a.x == b.x && a.z < b.z); });
    auto cr = [](const Vec3& o, const Vec3& a, const Vec3& b) { return (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x); };
    std::vector<Vec3> h(p.size() * 2); int k = 0;
    for (size_t i = 0; i < p.size(); i++) { while (k >= 2 && cr(h[k - 2], h[k - 1], p[i]) <= 0) k--; h[k++] = p[i]; }
    for (int i = (int)p.size() - 2, t = k + 1; i >= 0; i--) { while (k >= t && cr(h[k - 2], h[k - 1], p[i]) <= 0) k--; h[k++] = p[i]; }
    h.resize(std::max(k - 1, 0)); p = h;
}

void App::drawTraffic(const Vec3& headFwd) {
    const Route& R = world.d.route;
    BillMeshData glow;
    // shadows: where the sun throws the outline of each vehicle onto the road
    MeshData sh; sh.mat = MAT_UI; sh.layer = -1;
    float sunLum = env.sunColor.x * 0.3f + env.sunColor.y * 0.5f + env.sunColor.z * 0.2f;
    float shA = sat(sunLum * 0.55f) * (1.f - env.tunnel) * (1.f - env.night) * (1.f - sstep(0.5f, 0.95f, env.cloud));
    Vec3 cast(0, 0, 0);
    if (env.sunDir.y > 0.05f) { cast = Vec3(-env.sunDir.x, 0, -env.sunDir.z) * (1.f / env.sunDir.y); float l = length(cast); if (l > 4.f) cast = cast * (4.f / l); }
    auto shadow = [&](const Vec3& c, const Vec3& fw, const Vec3& rt, float hl, float hw, float hgt) {
        if (shA < 0.03f) return;
        std::vector<Vec3> pts;
        for (int a = -1; a <= 1; a += 2) for (int b = -1; b <= 1; b += 2) { Vec3 q = c + fw * (hl * a) + rt * (hw * b); pts.push_back(q); pts.push_back(q + cast * hgt); }
        hullXZ(pts);
        if (pts.size() < 3) return;
        sh.color(0x000000, (int)(shA * 255));
        uint32_t i0 = (uint32_t)sh.v.size();
        for (auto& q : pts) sh.vert(Vec3(q.x, c.y + 0.03f, q.z), Vec3(0, 1, 0));
        for (size_t k = 1; k + 1 < pts.size(); k++) sh.tri(i0, i0 + (uint32_t)k + 1, i0 + (uint32_t)k);
    };
    if (showBus) shadow(Vec3(0, 0, 0), busFwd, busRight, 6.0f, 1.25f, 3.4f);
    ren.lit.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D_ARRAY, ren.texFacade); ren.lit.seti("uTex", 0); ren.lit.set1("uTexGain", 1.f);
    for (const Vehicle& c : cars) {
        int ci = R.idx(c.s);
        if (c.dir < 0 && (R.flags[ci] & RF_TUNNEL)) continue;
        Vec3d p; Vec3 f, r; R.frame(c.s, p, f, r);
        Vec3d pa = R.center(c.s - 3), pb = R.center(c.s + 3);
        Vec3 fw = normalize(Vec3((float)(pb.x - pa.x), (float)(pb.y - pa.y), (float)(pb.z - pa.z))) * (float)c.dir;
        Vec3 rel((float)(p.x + r.x * c.lat - busPos.x), (float)(p.y - busPos.y), (float)(p.z + r.z * c.lat - busPos.z));
        float dist = length(rel);
        if (dist > 1500.f) continue;
        if (dist > 40.f && dot(rel, headFwd) / dist < -0.35f) continue;
        Vec3 rt = normalize(cross(fw, Vec3(0, 1, 0))), up = cross(rt, fw);
        Vec3 t = rgb(c.tint);
        ren.lit.set4("uTint", t.x, t.y, t.z, 1);
        ren.lit.setMat4("uModel", Mat4::basis(rt, up, -fw, rel));
        vehMesh[c.type].draw(); ren.stats.tris += vehMesh[c.type].count / 3; ren.stats.draws++;
        if (dist < 250.f) shadow(rel, fw, rt, vehInfo[c.type].length * 0.5f, vehInfo[c.type].width * 0.5f, vehInfo[c.type].height * 0.9f);
        if (env.night > 0.02f) {
            float hl = vehInfo[c.type].length * 0.5f, hw = vehInfo[c.type].width * 0.5f - 0.22f, y = c.type >= VEH_BOXTRUCK ? 0.95f : 0.72f;
            bool front = dot(fw, rel) < 0;       // we see its headlights when it faces us
            for (int sd = -1; sd <= 1; sd += 2) {
                Vec3 lp = rel + fw * (front ? hl : -hl) + rt * (hw * sd) + up * y;
                addGlow(glow, lp, front ? 0.55f : 0.32f, front ? 0xfff2d6 : 0xff2a1c, 255);
            }
        }
    }
    ren.lit.set4("uTint", 1, 1, 1, 1);
    if (sh.i.empty()) shadowMesh.destroy(); else shadowMesh.upload(sh, true);
    if (glow.i.empty()) vehGlow.destroy();
    else vehGlow.upload(glow.v.data(), glow.v.size() * sizeof(BVtx), glow.i.data(), glow.i.size(), LAYOUT_BVTX, true);
}

// Signal heads at the junctions where the bus waits; red while we approach and wait, green when we may go.
void App::buildSignals() {
    const Route& R = world.d.route;
    MeshData m; m.layer = -1;
    for (int k = 0; k < (int)R.stops.size(); k++) {
        if (R.stops[k].type != 0 || fabs(R.stops[k].s - s) > 450.0) continue;
        bool red = phase == PH_RIDE && ((k == nextStop && s > R.stops[k].s - 170.f) || (k == nextStop - 1 && dwellLeft > 1.5f));
        bool amber = phase == PH_RIDE && k == nextStop - 1 && dwellLeft > 0 && dwellLeft <= 1.5f;
        double ss = R.stops[k].s + 16.0;
        Vec3d p; Vec3 f, r; R.frame(ss, p, f, r);
        int i = R.idx(ss); float lat = R.lanes[i] * 3.3f + 1.0f;
        Vec3 base((float)(p.x + r.x * lat - busPos.x), (float)(p.y - busPos.y), (float)(p.z + r.z * lat - busPos.z));
        m.mat = MAT_LIT; m.color(0x70767c);
        m.cylinder(Mat4::identity(), base, base + Vec3(0, 6.6f, 0), 0.13f, 0.10f, 8, false);
        Vec3 armEnd = base + Vec3(0, 6.3f, 0) - r * 6.5f;
        m.cylinder(Mat4::identity(), base + Vec3(0, 6.3f, 0), armEnd, 0.07f, 0.06f, 6, false);
        for (int hd = 0; hd < 2; hd++) {
            Vec3 c = base + Vec3(0, 5.95f, 0) - r * (2.6f + hd * 3.3f) - f * 0.16f;
            Mat4 M = Mat4::basis(r, Vec3(0, 1, 0), -f, c);
            m.mat = MAT_LIT; m.color(0x1b1c1e);
            m.box(M, Vec3(-0.75f, -0.24f, -0.12f), Vec3(0.75f, 0.24f, 0.12f));
            static const int on[3] = {0xff2a18, 0xffb21e, 0x1fe06a}, off[3] = {0x3a1210, 0x3a2c10, 0x103a1e};
            int lit = red ? 0 : (amber ? 1 : 2);
            for (int q = 0; q < 3; q++) {
                m.mat = q == lit ? MAT_EMIT : MAT_LIT; m.color(q == lit ? on[q] : off[q]);
                float x = (q - 1) * 0.46f; Vec3 o = c - f * 0.125f;
                // disc facing the oncoming traffic
                uint32_t i0 = m.vert(o + r * x, -f);
                for (int a = 0; a <= 12; a++) { float an = (float)a / 12 * 2 * PI; m.vert(o + r * (x + cosf(an) * 0.17f) + Vec3(0, sinf(an) * 0.17f, 0), -f); }
                for (int a = 0; a < 12; a++) m.tri(i0, i0 + 1 + a, i0 + 2 + a);
            }
        }
    }
    if (m.i.empty()) sigMesh.destroy(); else sigMesh.upload(m, true);
}
