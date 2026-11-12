// World data (route, terrain, buildings, roads) and the chunk generators / streamer built on it.
#pragma once
#include "gfx.h"
#include <thread>
#include <mutex>
#include <condition_variable>
#include <deque>
#include <unordered_map>
#include <memory>
#include <atomic>
#include <functional>

enum RouteKind { RK_CITY = 0, RK_RAMP = 1, RK_EXP = 2, RK_LOT = 3 };
enum RouteFlag { RF_BRIDGE = 1, RF_TUNNEL = 2, RF_BUSLANE = 4, RF_LIT = 8, RF_BARR = 16, RF_BARL = 32, RF_TOLL = 64, RF_REST = 128 };
enum PlaceType { PT_IC = 0, PT_JC = 1, PT_REST = 2, PT_TG = 3, PT_STOP = 4, PT_EXIT = 5 };
enum LandClass { LC_NONE = 0, LC_TREE = 1, LC_SHRUB = 2, LC_GRASS = 3, LC_CROP = 4, LC_BUILT = 5, LC_BARE = 6, LC_WATER = 7 };

struct Place { float s; int type; std::string name; };
struct Stop { float s, dwell; int type; };
struct RouteProj { int i = 0; float u = 0; double s = 0; float lat = 0, dist = 1e9f; };

struct Route {
    int N = 0; float step = 5;
    std::vector<double> x, z;
    std::vector<float> y, off, v, t, extL, extR, W;
    std::vector<uint8_t> lanes, kind; std::vector<uint16_t> flags;
    std::vector<float> wBridge, wTunnel, limL, limR, curv;      // derived at load
    std::vector<Stop> stops; std::vector<Place> places; std::vector<std::pair<float, std::string>> regions;
    float S_TG = 0, S_REST = 0, S_PARK = 0, S_EXITTOLL = 0, LEAD_S = 0, REST_LANE = 0, total = 0, S_ENTER = 0;
    double lon0 = 128, lat0 = 36.4;
    // spatial hash
    double hx0 = 0, hz0 = 0; int hnx = 0, hnz = 0; std::vector<uint32_t> hoff, hidx;

    bool load();
    float length() const { return (N - 1) * step; }
    int idx(double s) const { int i = (int)(s / step); return i < 0 ? 0 : (i > N - 2 ? N - 2 : i); }
    float attr(const std::vector<float>& a, double s) const { int i = idx(s); float u = clampf((float)(s / step - i), 0, 1); return a[i] + (a[i + 1] - a[i]) * u; }
    // centreline position / horizontal frame at arclength s
    Vec3d center(double s) const;
    void frame(double s, Vec3d& pos, Vec3& fwd, Vec3& right) const;
    bool project(double X, double Z, float maxDist, RouteProj& out) const;
    const char* regionAt(double s) const;
    void lonLat(double s, double& lon, double& lat) const;
};

struct Terrain {
    double X0 = 0, N0 = 0; float NT = 1024, FT = 4096; int nx = 0, nn = 0, fx = 0, fn = 0;
    std::vector<int32_t> ndir, fdir;
    std::vector<uint16_t> nh, fh; std::vector<uint8_t> nlc, flc;
    bool load();
    bool hasNear(int jx, int jn) const { return jx >= 0 && jn >= 0 && jx < nx && jn < nn && ndir[jn * nx + jx] >= 0; }
    bool hasFar(int jx, int jn) const { return jx >= 0 && jn >= 0 && jx < fx && jn < fn && fdir[jn * fx + jx] >= 0; }
    float nodeNear(int i, int j, bool& ok) const;     // global 32 m node
    float nodeFar(int i, int j) const;                // global 128 m node
    float dem(double x, double n) const;              // best available
    float demFar(double x, double n) const;
    int lc(double x, double n) const;
    int lcFar(double x, double n) const;
};

struct BuildingRec { float x, n; uint16_t l, w, h; uint8_t a, t; };

struct WorldData {
    Route route; Terrain terr;
    // buildings
    double bX0 = 0, bN0 = 0; float bT = 512; int bnx = 0, bnn = 0; std::vector<uint32_t> bdir; std::vector<BuildingRec> bld;
    // other roads
    double rX0 = 0, rN0 = 0; float rT = 1024; int rnx = 0, rnn = 0; std::vector<uint32_t> rdir, roff; std::vector<uint8_t> rbody;
    bool load();
    // ground height with the road corridor carved in (world X, Z = -north)
    float ground(double X, double Z, RouteProj* rp = nullptr) const;
    float carve(float dem, const RouteProj& p) const;
};

// ---------------- chunk meshes ----------------
struct TerrainMeshData { std::vector<TVtx> v; std::vector<uint32_t> i; };
struct BillMeshData { std::vector<BVtx> v; std::vector<uint32_t> i; };

struct ChunkData {              // CPU side, produced on the worker thread
    Vec3d origin; float radius = 0;
    TerrainMeshData terrain;    // splat terrain
    MeshData road;              // road surface shader
    MeshData decal;             // road shader / lit with polygon offset
    MeshData lit;               // generic lit geometry
    MeshData glass;             // alpha blended
    MeshData text;              // glyph quads
    BillMeshData trees;         // alpha-tested billboards
    BillMeshData glow;          // additive night glows
};
struct Chunk {
    uint64_t key = 0; int type = 0, lod = -1, wantLod = -1; bool ready = false, pending = false; int stamp = 0;
    std::vector<TVtx> cpuV; uint64_t cover = 0;      // far tiles keep their vertices so they can sink under loaded near tiles
    Vec3d origin; float radius = 0;
    Mesh terrain, road, decal, lit, glass, text, trees, glow;
    void destroy() { terrain.destroy(); road.destroy(); decal.destroy(); lit.destroy(); glass.destroy(); text.destroy(); trees.destroy(); glow.destroy(); }
};
enum ChunkType { CT_FAR = 0, CT_NEAR = 1, CT_ROAD = 2, CT_SCENE = 3 };

struct World {
    WorldData d;
    Font* font = nullptr;
    std::unordered_map<uint64_t, std::unique_ptr<Chunk>> chunks;
    // worker
    std::thread worker; std::mutex mtx; std::condition_variable cv; bool quit = false;
    struct Job { uint64_t key; int type, a, b, lod; double prio; };
    std::deque<Job> jobs; std::deque<std::pair<Job, std::shared_ptr<ChunkData>>> done;
    std::atomic<int> inflight{0};
    int frameStamp = 0;

    bool init(Font* f);
    void shutdown();
    // request / retire chunks around the bus; blocking = finish everything now (used by the desktop harness and on first load)
    void update(double busS, const Vec3d& busPos, bool blocking);
    void build(const Job& j, ChunkData& out);
    // generators (worker thread)
    void genFar(int jx, int jn, int lod, ChunkData& out);
    void genNear(int jx, int jn, ChunkData& out);
    void genRoad(int ci, int lod, ChunkData& out);
    void genScene(int jx, int jn, int lod, ChunkData& out);
    // set pieces appended by genRoad
    void genSigns(int i0, int i1, int lod, ChunkData& out);
    void genSetPieces(int i0, int i1, int lod, ChunkData& out);
    void upload(Chunk& c, ChunkData& d);
};
uint64_t chunkKey(int type, int a, int b);
// land-cover class -> splat weights (grass, forest, crop, urban), water, bare
void lcWeights(int lc, float w[6]);
