// Headless test harness: renders the same scene the headset shows into PNG files (software GL).
#include "app.h"
#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <chrono>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "third_party/stb_image_write.h"

static std::string gAssetDir = "../assets";
bool platformReadAsset(const char* name, std::vector<uint8_t>& out) {
    FILE* f = fopen((gAssetDir + "/" + name).c_str(), "rb"); if (!f) return false;
    fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET); out.resize(n);
    size_t r = fread(out.data(), 1, n, f); fclose(f); return r == (size_t)n;
}
void* platformGLProc(const char* name) { return (void*)eglGetProcAddress(name); }
std::string platformSavePath() { return "/tmp/busvr_save.bin"; }

static Quat quatYawPitch(float yaw, float pitch) {
    float cy = cosf(yaw / 2), sy = sinf(yaw / 2), cp = cosf(pitch / 2), sp = sinf(pitch / 2);
    return Quat{cy * sp, sy * cp, -sy * sp, cy * cp};      // yaw about Y, then pitch about local X
}
int main(int argc, char** argv) {
    double km = 60; float yaw = 0, pitch = 0, clock = 14, scale = 1, fov = 100; int W = 1280, H = 1280, mono = 1, month = 11, frames = 0; std::string out = "/tmp/shot.png"; int phase = PH_RIDE;
    float ex = 0, ey = 0, ez = 0; float cloud = 0.35f; int both = 0; int seatArg = 0, busArg = 1, hudArg = 0, menuArg = 0;
    for (int i = 1; i + 1 < argc; i += 2) {
        std::string k = argv[i]; const char* v = argv[i + 1];
        if (k == "--km") km = atof(v); else if (k == "--yaw") yaw = atof(v); else if (k == "--pitch") pitch = atof(v); else if (k == "--clock") clock = atof(v);
        else if (k == "--out") out = v; else if (k == "--w") W = atoi(v); else if (k == "--h") H = atoi(v); else if (k == "--fov") fov = atof(v);
        else if (k == "--month") month = atoi(v); else if (k == "--assets") gAssetDir = v; else if (k == "--frames") frames = atoi(v); else if (k == "--scale") scale = atof(v);
        else if (k == "--ex") ex = atof(v); else if (k == "--ey") ey = atof(v); else if (k == "--ez") ez = atof(v); else if (k == "--cloud") cloud = atof(v);
        else if (k == "--phase") phase = atoi(v); else if (k == "--seat") seatArg = atoi(v); else if (k == "--bus") busArg = atoi(v); else if (k == "--hud") hudArg = atoi(v); else if (k == "--menu") menuArg = atoi(v); else if (k == "--both") both = atoi(v);
    }
    EGLDisplay dpy = eglGetPlatformDisplay(EGL_PLATFORM_SURFACELESS_MESA, EGL_DEFAULT_DISPLAY, nullptr);
    EGLint ma, mi; if (!eglInitialize(dpy, &ma, &mi)) { LOGE("egl init failed"); return 1; }
    eglBindAPI(EGL_OPENGL_ES_API);
    EGLint ca[] = {EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT, EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8, EGL_NONE};
    EGLConfig cfg; EGLint n; eglChooseConfig(dpy, ca, &cfg, 1, &n);
    EGLint xa[] = {EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE}; EGLContext ctx = eglCreateContext(dpy, cfg, EGL_NO_CONTEXT, xa);
    EGLint pa[] = {EGL_WIDTH, 16, EGL_HEIGHT, 16, EGL_NONE}; EGLSurface surf = eglCreatePbufferSurface(dpy, cfg, pa);
    if (!eglMakeCurrent(dpy, surf, surf, ctx)) { LOGE("make current failed"); return 1; }

    App app; app.seat = seatArg; app.showBus = busArg != 0; app.nowClock = clock;
    if (!app.init()) { LOGE("app init failed"); return 1; }
    app.month = month; app.dayOfYear = (month - 1) * 30 + 15; app.env.cloud = cloud; app.hud = hudArg != 0;
    if (phase == PH_RIDE) { app.startTrip(false); app.annDepart = true; app.menuOpen = menuArg != 0; }
    app.phase = phase; app.s = km * 1000.0; app.departClock = clock; app.timeScale = scale;
    const Route& R = app.world.d.route;
    app.nextStop = 0; while (app.nextStop < (int)R.stops.size() && R.stops[app.nextStop].s <= app.s) app.nextStop++;
    const int SS = 2;                                   // supersample for clean edges
    StereoTarget rt; rt.init(W * SS, H * SS, 1);
    GLuint color; glGenTextures(1, &color); glBindTexture(GL_TEXTURE_2D_ARRAY, color);
    glTexStorage3D(GL_TEXTURE_2D_ARRAY, 1, GL_SRGB8_ALPHA8, W * SS, H * SS, 2);
    AppInput in; float t = tanf(radf(fov) * 0.5f);
    for (int e = 0; e < 2; e++) {
        in.eye[e].rot = quatYawPitch(radf(yaw), radf(pitch));
        Vec3 off = rotate(in.eye[e].rot, Vec3(e ? 0.032f : -0.032f, 0, 0));
        in.eye[e].pos = Vec3(ex, ey, ez) + off;
        in.eye[e].tanL = -t; in.eye[e].tanR = t; in.eye[e].tanU = t * H / W; in.eye[e].tanD = -t * H / W;
    }
    in.dt = 0;
    auto t0 = std::chrono::steady_clock::now();
    app.update(in, true);
    auto t1 = std::chrono::steady_clock::now();
    for (int fr = 0; fr < frames; fr++) { in.dt = 1.0 / 72; app.update(in, true); }
    app.render(rt, color, in);
    glFinish();
    auto t2 = std::chrono::steady_clock::now();
    LOGI("load %.2fs render %.2fs  chunks=%d tris=%d draws=%d  s=%.1fkm clock=%.2f sunEl=%.1f region=%s", std::chrono::duration<double>(t1 - t0).count(), std::chrono::duration<double>(t2 - t1).count(),
         app.ren.stats.chunks, app.ren.stats.tris, app.ren.stats.draws, app.s / 1000, app.env.clockHours, app.env.sunElev, R.regionAt(app.s));
    { int cnt[4]={0,0,0,0}, rdy[4]={0,0,0,0}, tri[4]={0,0,0,0}; for (auto& kv : app.world.chunks) { Chunk& c=*kv.second; cnt[c.type]++; rdy[c.type]+=c.ready; tri[c.type]+=(c.terrain.count+c.road.count+c.lit.count+c.decal.count+c.trees.count)/3; }
      LOGI("chunks far %d/%d (%d tris) near %d/%d (%d) road %d/%d (%d) scene %d/%d (%d)  bus=(%.1f,%.1f,%.1f) fwd=(%.2f,%.2f,%.2f)", rdy[0],cnt[0],tri[0], rdy[1],cnt[1],tri[1], rdy[2],cnt[2],tri[2], rdy[3],cnt[3],tri[3], app.busPos.x, app.busPos.y, app.busPos.z, app.busFwd.x, app.busFwd.y, app.busFwd.z); }
    GLenum err = glGetError(); if (err) LOGE("GL error 0x%x", err);
    // read back
    GLuint fb; glGenFramebuffers(1, &fb); glBindFramebuffer(GL_READ_FRAMEBUFFER, fb);
    int eyes = both ? 2 : 1;
    std::vector<uint8_t> img((size_t)W * eyes * H * 3), px((size_t)W * SS * H * SS * 4);
    for (int e = 0; e < eyes; e++) {
        glFramebufferTextureLayer(GL_READ_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, color, 0, e);
        glReadPixels(0, 0, W * SS, H * SS, GL_RGBA, GL_UNSIGNED_BYTE, px.data());
        for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) for (int c = 0; c < 3; c++) {
            // average in linear light, then back to sRGB
            float acc = 0;
            for (int sy = 0; sy < SS; sy++) for (int sx = 0; sx < SS; sx++) acc += toLin(px[(((size_t)(H * SS - 1 - (y * SS + sy))) * W * SS + x * SS + sx) * 4 + c] / 255.f);
            acc /= SS * SS; float sr = acc <= 0.0031308f ? acc * 12.92f : 1.055f * powf(acc, 1 / 2.4f) - 0.055f;
            img[((size_t)y * W * eyes + e * W + x) * 3 + c] = (uint8_t)(sat(sr) * 255 + 0.5f);
        }
    }
    stbi_write_png(out.c_str(), W * eyes, H, 3, img.data(), W * eyes * 3);
    (void)mono;
    app.shutdown();
    return 0;
}
