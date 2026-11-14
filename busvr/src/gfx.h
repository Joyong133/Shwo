// Thin OpenGL ES 3 layer: shaders, meshes, textures, stereo render targets, text.
#pragma once
#include "base.h"
#include <GLES3/gl3.h>
#include <GLES2/gl2ext.h>
#include <map>
#include <string>

// ---------- platform hooks (implemented by main_android.cpp / main_desktop.cpp) ----------
bool platformReadAsset(const char* name, std::vector<uint8_t>& out);
void* platformGLProc(const char* name);
std::string platformSavePath();
// other apps on the headset (main_android.cpp talks to BusActivity.java; the desktop build fakes a few)
static const int kAppTile = 256;
struct AppEntry { std::string pkg, label; bool apk = false, vr = false; std::vector<uint8_t> rgba; };   // rgba: kAppTile^2 * 4, top row first
bool platformListApps(std::vector<AppEntry>& out);       // slow: call from a worker thread
bool platformLaunchApp(const std::string& pkg, const std::string& title, const std::string& text);
double platformWallClock();                              // seconds since 1970
// seat monitor: the adb-started helper (SeatHelper.java) runs APKs on a virtual display that draws into our texture
int platformHelperState();                               // 1 = helper connected
int platformMonitorOpen(unsigned glTexture, int w, int h, int dpi);   // virtual display id, or -1
bool platformMonitorLaunch(const std::string& pkg);      // slow (restarts the app on the monitor): call from a worker thread
void platformMonitorTouch(int action, float x, float y); // MotionEvent action: 0 down, 1 up, 2 move
void platformMonitorScroll(float x, float y, float v);
void platformMonitorKey(int keyCode);
void platformMonitorClose();
bool platformMonitorUpdate(float matrix[16]);           // latch the newest frame (GL thread); true once a frame has arrived

bool readAssetZ(const char* name, std::vector<uint8_t>& out);   // "<name>.z" = u32 rawSize + zlib stream

// ---------- vertex formats ----------
enum Mat : uint8_t {
    MAT_LIT = 0,      // sun + sky lit, fogged
    MAT_WINDOW = 1,   // facade: texture alpha marks windows that light up at night
    MAT_EMIT = 2,     // always self-lit (LEDs, signals, lamps)
    MAT_CABIN = 3,    // inside the bus: lit by cabin light, never fogged
    MAT_PAINT = 4,    // glossy vehicle paint
    MAT_TUNNEL = 5,   // tunnel lining: lit by tunnel lamps
    MAT_NIGHTLAMP = 6,// emissive only at night (street lamps, head/tail lights)
    MAT_SIGN = 7,     // retro-reflective road sign: lights up in the headlights at night
    MAT_UI = 8,       // exact colour, unlit, never fogged (menus, screens)
    MAT_UITEX = 9     // textured, unlit, alpha from the texture (app icons)
};
struct Vtx {          // 32 bytes
    float px, py, pz;
    int8_t nx, ny, nz; uint8_t mat;
    uint8_t r, g, b, a;
    float u, v, w;    // w = texture array layer (<0: untextured)
};
struct TVtx {         // terrain, 24 bytes
    float px, py, pz;
    int8_t nx, ny, nz, pad;
    uint8_t r, g, b, a;
    float u, v;
};
struct BVtx {         // camera-facing billboard corner, 32 bytes
    float px, py, pz;
    float ox, oy;
    float u, v;
    uint8_t r, g, b, a;
};

struct MeshData {
    std::vector<Vtx> v;
    std::vector<uint32_t> i;
    void clear() { v.clear(); i.clear(); }
    bool empty() const { return i.empty(); }
    // current state used by the helpers
    uint8_t cr = 255, cg = 255, cb = 255, ca = 255, mat = MAT_LIT; float layer = -1;
    void color(int hex, int a = 255) { cr = (hex >> 16) & 255; cg = (hex >> 8) & 255; cb = hex & 255; ca = (uint8_t)a; }
    void colorf(const Vec3& c, float a = 1) { cr = (uint8_t)(sat(c.x) * 255); cg = (uint8_t)(sat(c.y) * 255); cb = (uint8_t)(sat(c.z) * 255); ca = (uint8_t)(sat(a) * 255); }
    uint32_t vert(const Vec3& p, const Vec3& n, float u = 0, float vv = 0);
    void tri(uint32_t a, uint32_t b, uint32_t c) { i.push_back(a); i.push_back(b); i.push_back(c); }
    // quad a,b,c,d counter-clockwise seen from the front; uv rect (u0,v0)-(u1,v1) mapped a=(u0,v0) b=(u1,v0) c=(u1,v1) d=(u0,v1)
    void quad(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d, float u0 = 0, float v0 = 0, float u1 = 1, float v1 = 1);
    void quadN(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d, const Vec3& n, float u0 = 0, float v0 = 0, float u1 = 1, float v1 = 1);
    // axis-aligned box in the local frame of M (pass identity for none). faces mask: 1=+x 2=-x 4=+y 8=-y 16=+z 32=-z
    void box(const Mat4& M, const Vec3& lo, const Vec3& hi, int faces = 63, float uvScale = 1.f);
    // box with a bevelled (chamfered) outline along one axis for softer shapes
    void roundBox(const Mat4& M, const Vec3& lo, const Vec3& hi, float r, int seg = 3, float uvScale = 1.f);
    void cylinder(const Mat4& M, const Vec3& a, const Vec3& b, float ra, float rb, int seg = 10, bool caps = true);
    // sweep a 2D profile (x = lateral, y = up) along a path of frames; profile closed or open
    void append(const MeshData& o, const Mat4& M);
};

enum Layout { LAYOUT_VTX, LAYOUT_TVTX, LAYOUT_BVTX };
struct Mesh {
    GLuint vao = 0, vbo = 0, ibo = 0; int count = 0; Layout layout = LAYOUT_VTX;
    void upload(const void* verts, size_t vbytes, const uint32_t* idx, size_t icount, Layout l, bool dynamic = false);
    void upload(const MeshData& d, bool dynamic = false) { upload(d.v.data(), d.v.size() * sizeof(Vtx), d.i.data(), d.i.size(), LAYOUT_VTX, dynamic); }
    void draw() const;
    void destroy();
    bool valid() const { return vao != 0 && count > 0; }
};

struct Shader {
    GLuint prog = 0;
    std::map<std::string, GLint> locs;
    bool build(const char* name, const char* vs, const char* fs, const char* fsPreamble = "");
    void use() const { glUseProgram(prog); }
    GLint loc(const char* n);
    void setMat4(const char* n, const Mat4& m) { glUniformMatrix4fv(loc(n), 1, GL_FALSE, m.m); }
    void set4(const char* n, float a, float b, float c, float d) { glUniform4f(loc(n), a, b, c, d); }
    void set3(const char* n, const Vec3& v) { glUniform3f(loc(n), v.x, v.y, v.z); }
    void set1(const char* n, float a) { glUniform1f(loc(n), a); }
    void seti(const char* n, int a) { glUniform1i(loc(n), a); }
};

// Per-frame globals shared by all shaders (std140 uniform block "Frame").
struct FrameUBO {
    float viewProj[2][16];
    float eyePos[2][4];
    float sunDir[4];      // xyz = direction to the sun, w = night (0 day .. 1 night)
    float sunColor[4];
    float skyAmb[4];
    float groundAmb[4];
    float fogColor[4];    // a = density (1/m)
    float fogSun[4];      // rgb = glow colour towards the sun, a = strength
    float cabin[4];       // rgb = cabin fill light, a = lamp level
    float busPos[4];      // camera-relative bus origin
    float busFwd[4];      // xyz forward, w = headlight intensity
    float time[4];        // x = seconds, y = season tint, z = unused, w = tunnel factor
    float skyZenith[4];
    float skyHorizon[4];
    float misc[4];        // x = cloud cover, y = star visibility, z = exposure, w = view index (non-multiview)
    float invViewProj[2][16];
};

struct Gfx {
    bool multiview = false, msaaMultiview = false, msaaRTT = false, aniso = false;
    GLuint ubo = 0;
    void init();
    void updateFrame(const FrameUBO& f);
    static Gfx& get();
};

// ---------- stereo render target bound to a 2-layer colour texture array ----------
struct StereoTarget {
    int w = 0, h = 0, samples = 1; bool multiview = false;
    GLuint depthTex = 0;
    std::map<GLuint, GLuint> fboMV;                 // colour array texture -> multiview fbo
    std::map<GLuint, std::pair<GLuint, GLuint>> fboEye;   // colour texture -> per-eye fbos
    GLuint msFbo = 0, msColor = 0, msDepth = 0, depthEye[2] = {0, 0};
    void init(int w, int h, int samples);
    // returns number of passes (1 with multiview, 2 without); call bind(pass) for each, then resolve(pass)
    int passes() const { return multiview ? 1 : 2; }
    void bind(GLuint colorArrayTex, int pass);
    void resolve(GLuint colorArrayTex, int pass);
};

// ---------- textures ----------
GLuint loadTexture2D(const char* asset, bool srgb, bool mips = true, bool repeat = true);
// vertical strip of `layers` equally tall images -> GL_TEXTURE_2D_ARRAY
GLuint loadTextureArray(const char* asset, int layers, bool srgb);
GLuint makeTexture2D(int w, int h, GLenum internal, GLenum fmt, GLenum type, const void* px, bool mips, bool repeat);

// ---------- text ----------
struct Glyph { uint16_t x, y, w, h; int16_t xo, yo; uint16_t adv; };
struct Font {
    GLuint tex = 0; int tw = 0, th = 0; float px = 64, ascent = 0, lineH = 0;
    std::map<uint32_t, Glyph> glyphs;
    bool load(const char* asset);
    float width(const char* utf8, float size) const;
    // appends quads (uv into the atlas, layer = -2 marks "glyph" for the text shader). origin = left end of baseline.
    void draw(MeshData& out, const char* utf8, const Vec3& origin, const Vec3& right, const Vec3& up, float size, int align = 0) const;
};
uint32_t utf8Next(const char*& p);
