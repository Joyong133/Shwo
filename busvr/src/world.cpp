// Chunk streaming: decides what should exist around the bus, builds it on a worker thread, uploads on the render thread.
#include "world.h"

uint64_t chunkKey(int type, int a, int b) { return ((uint64_t)type << 56) | ((uint64_t)(uint32_t)(a & 0xFFFFFFF) << 28) | (uint64_t)(uint32_t)(b & 0xFFFFFFF); }

bool World::init(Font* f) {
    font = f;
    if (!d.load()) return false;
    worker = std::thread([this]() {
        for (;;) {
            Job j;
            {
                std::unique_lock<std::mutex> lk(mtx);
                cv.wait(lk, [this]() { return quit || !jobs.empty(); });
                if (quit) return;
                auto best = jobs.begin();
                for (auto it = jobs.begin(); it != jobs.end(); ++it) if (it->prio < best->prio) best = it;
                j = *best; jobs.erase(best);
            }
            auto cd = std::make_shared<ChunkData>();
            build(j, *cd);
            { std::lock_guard<std::mutex> lk(mtx); done.push_back({j, cd}); }
        }
    });
    return true;
}
void World::shutdown() {
    { std::lock_guard<std::mutex> lk(mtx); quit = true; }
    cv.notify_all();
    if (worker.joinable()) worker.join();
    for (auto& c : chunks) c.second->destroy();
    chunks.clear();
}
void World::build(const Job& j, ChunkData& out) {
    switch (j.type) {
        case CT_FAR: genFar(j.a, j.b, j.lod, out); break;
        case CT_NEAR: genNear(j.a, j.b, out); break;
        case CT_ROAD: genRoad(j.a, j.lod, out); break;
        case CT_SCENE: genScene(j.a, j.b, j.lod, out); break;
    }
}
void World::upload(Chunk& c, ChunkData& cd) {
    c.origin = cd.origin; c.radius = cd.radius;
    auto up = [](Mesh& m, MeshData& md) { if (md.i.empty()) m.destroy(); else m.upload(md); };
    if (cd.terrain.i.empty()) c.terrain.destroy();
    else c.terrain.upload(cd.terrain.v.data(), cd.terrain.v.size() * sizeof(TVtx), cd.terrain.i.data(), cd.terrain.i.size(), LAYOUT_TVTX, c.type == CT_FAR && c.lod == 0);
    up(c.road, cd.road); up(c.decal, cd.decal); up(c.lit, cd.lit); up(c.glass, cd.glass); up(c.text, cd.text);
    if (cd.trees.i.empty()) c.trees.destroy(); else c.trees.upload(cd.trees.v.data(), cd.trees.v.size() * sizeof(BVtx), cd.trees.i.data(), cd.trees.i.size(), LAYOUT_BVTX);
    if (cd.glow.i.empty()) c.glow.destroy(); else c.glow.upload(cd.glow.v.data(), cd.glow.v.size() * sizeof(BVtx), cd.glow.i.data(), cd.glow.i.size(), LAYOUT_BVTX);
    if (c.type == CT_FAR && c.lod == 0) { c.cpuV = cd.terrain.v; c.cover = 0; } else c.cpuV.clear();
    c.ready = true;
}

void World::update(double busS, const Vec3d& bp, bool blocking) {
    frameStamp++;
    const Terrain& T = d.terr; const Route& R = d.route;
    double bn = -bp.z;
    auto want = [&](int type, int a, int b, int lod, double prio) {
        uint64_t key = chunkKey(type, a, b);
        auto it = chunks.find(key);
        Chunk* c;
        if (it == chunks.end()) { auto u = std::make_unique<Chunk>(); c = u.get(); c->key = key; c->type = type; c->lod = -1; chunks[key] = std::move(u); }
        else c = it->second.get();
        c->stamp = frameStamp;
        if (c->wantLod != lod && !c->pending) {
            c->pending = true; c->wantLod = lod;
            std::lock_guard<std::mutex> lk(mtx); jobs.push_back(Job{key, type, a, b, lod, prio});
        }
    };
    // far terrain
    {
        const double RF = 26000; int cx = (int)floor((bp.x - T.X0) / T.FT), cn = (int)floor((bn - T.N0) / T.FT), r = (int)(RF / T.FT) + 1;
        for (int jn = cn - r; jn <= cn + r; jn++) for (int jx = cx - r; jx <= cx + r; jx++) {
            if (!T.hasFar(jx, jn)) continue;
            double dx = T.X0 + (jx + 0.5) * T.FT - bp.x, dn = T.N0 + (jn + 0.5) * T.FT - bn, dist = sqrt(dx * dx + dn * dn);
            if (dist > RF) continue;
            // hysteresis: keep the current level unless clearly in another band
            int lod = dist < 9000 ? 0 : (dist < 17000 ? 1 : 2);
            auto it = chunks.find(chunkKey(CT_FAR, jx, jn));
            if (it != chunks.end() && it->second->wantLod >= 0) {
                int cur = it->second->wantLod;
                if (cur == 0 && dist < 9800) lod = 0; else if (cur == 1 && dist > 8200 && dist < 17800) lod = 1; else if (cur == 2 && dist > 16200) lod = 2;
            }
            want(CT_FAR, jx, jn, lod, 5e5 + dist);
        }
    }
    // near terrain
    {
        const double RN = 3300; int cx = (int)floor((bp.x - T.X0) / T.NT), cn = (int)floor((bn - T.N0) / T.NT), r = (int)(RN / T.NT) + 1;
        for (int jn = cn - r; jn <= cn + r; jn++) for (int jx = cx - r; jx <= cx + r; jx++) {
            if (!T.hasNear(jx, jn)) continue;
            double dx = T.X0 + (jx + 0.5) * T.NT - bp.x, dn = T.N0 + (jn + 0.5) * T.NT - bn, dist = sqrt(dx * dx + dn * dn);
            if (dist > RN) continue;
            want(CT_NEAR, jx, jn, 0, 1e5 + dist);
        }
    }
    // road corridor
    {
        int ci = (int)(busS / R.step) / 40, nci = (R.N - 2) / 40;
        for (int k = ci - 16; k <= ci + 17; k++) {
            if (k < 0 || k > nci) continue;
            int dk = abs(k - ci); int lod = dk <= 3 ? 0 : (dk <= 8 ? 1 : 2);
            auto it = chunks.find(chunkKey(CT_ROAD, k, 0));
            if (it != chunks.end() && it->second->wantLod >= 0) { int cur = it->second->wantLod; if (cur == 0 && dk <= 4) lod = 0; else if (cur == 1 && dk >= 3 && dk <= 9) lod = 1; }
            want(CT_ROAD, k, 0, lod, dk * 200.0);
        }
    }
    // scenery
    {
        const double RS = 2500; int cx = (int)floor((bp.x - d.bX0) / d.bT), cn = (int)floor((bn - d.bN0) / d.bT), r = (int)(RS / d.bT) + 1;
        for (int jn = cn - r; jn <= cn + r; jn++) for (int jx = cx - r; jx <= cx + r; jx++) {
            double dx = d.bX0 + (jx + 0.5) * d.bT - bp.x, dn = d.bN0 + (jn + 0.5) * d.bT - bn, dist = sqrt(dx * dx + dn * dn);
            if (dist > RS) continue;
            if (!T.hasNear((int)floor((d.bX0 + (jx + 0.5) * d.bT - T.X0) / T.NT), (int)floor((d.bN0 + (jn + 0.5) * d.bT - T.N0) / T.NT))) continue;
            int lod = dist < 750 ? 0 : (dist < 1500 ? 1 : 2);
            auto it = chunks.find(chunkKey(CT_SCENE, jx, jn));
            if (it != chunks.end() && it->second->wantLod >= 0) { int cur = it->second->wantLod; if (cur == 0 && dist < 900) lod = 0; else if (cur == 1 && dist > 650 && dist < 1650) lod = 1; else if (cur == 2 && dist > 1400) lod = 2; }
            want(CT_SCENE, jx, jn, lod, 2e4 + dist);
        }
    }
    cv.notify_all();

    // collect finished chunks
    auto drain = [&](int maxUploads) {
        int n = 0;
        for (;;) {
            std::pair<Job, std::shared_ptr<ChunkData>> item;
            { std::lock_guard<std::mutex> lk(mtx); if (done.empty()) break; item = done.front(); done.pop_front(); }
            auto it = chunks.find(item.first.key);
            if (it != chunks.end()) { Chunk& c = *it->second; c.pending = false; c.lod = item.first.lod; upload(c, *item.second); }
            if (++n >= maxUploads) break;
        }
    };
    if (blocking) {
        for (;;) {
            drain(1 << 30);
            bool busy = false;
            { std::lock_guard<std::mutex> lk(mtx); busy = !jobs.empty() || !done.empty(); }
            if (!busy) { bool any = false; for (auto& c : chunks) if (c.second->pending) { any = true; break; } if (!any) break; }
            std::this_thread::sleep_for(std::chrono::milliseconds(2));
        }
    } else drain(2);

    // retire chunks that fell out of range (a few frames of grace so borders do not thrash)
    for (auto it = chunks.begin(); it != chunks.end();) {
        Chunk& c = *it->second;
        if (c.stamp < frameStamp - 90 && !c.pending) { c.destroy(); it = chunks.erase(it); } else ++it;
    }

    // far tiles sink where a loaded near tile covers them
    for (auto& kv : chunks) {
        Chunk& c = *kv.second;
        if (c.type != CT_FAR || c.lod != 0 || !c.ready || c.cpuV.empty()) continue;
        int jx = (int)((c.key >> 28) & 0xFFFFFFF), jn = (int)(c.key & 0xFFFFFFF);
        uint64_t sig = 1;
        for (int a = -1; a <= 4; a++) for (int b = -1; b <= 4; b++) {
            auto it = chunks.find(chunkKey(CT_NEAR, jx * 4 + b, jn * 4 + a));
            sig = (sig << 1) | (uint64_t)((it != chunks.end() && it->second->ready) ? 1 : 0);
        }
        if (sig == c.cover) continue;
        c.cover = sig;
        auto covered = [&](int ca, int cb) {      // far cell (128 m) index relative to this tile, may reach into neighbours
            int na = jn * 4 + (int)floor(ca / 8.0), nb = jx * 4 + (int)floor(cb / 8.0);
            auto it = chunks.find(chunkKey(CT_NEAR, nb, na));
            return it != chunks.end() && it->second->ready;
        };
        std::vector<TVtx> v = c.cpuV;
        for (int a = 0; a <= 32; a++) for (int b = 0; b <= 32; b++)
            if (covered(a - 1, b - 1) && covered(a - 1, b) && covered(a, b - 1) && covered(a, b)) v[a * 33 + b].py -= 140.f;
        glBindBuffer(GL_ARRAY_BUFFER, c.terrain.vbo);
        glBufferSubData(GL_ARRAY_BUFFER, 0, (GLsizeiptr)(v.size() * sizeof(TVtx)), v.data());
    }
}
