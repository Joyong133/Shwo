// Headless test harness: renders the same scene the headset shows into PNG files (software GL).
#include "app.h"
#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <chrono>
#include <thread>
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
double platformWallClock() { return (double)time(nullptr); }
// A few made-up apps so the app page can be checked without a headset.
bool platformListApps(std::vector<AppEntry>& out) {
    static const char* names[] = {"내 게임.apk", "영상 플레이어", "SideQuest 앱", "브라우저", "유튜브 VR", "넷플릭스", "음악", "사진", "체스", "지도", "날씨", "메모", "탁구"};
    static const int cols[] = {0xe0533d, 0x3d8be0, 0x3dbf6a, 0xf2b84b, 0xd33a3a, 0x111111, 0x8a4be0, 0x2fb5c9, 0x6b4a2c, 0x4caf50, 0x64b5f6, 0xffd54f, 0xff7043};
    for (int k = 0; k < 13; k++) {
        AppEntry a; a.pkg = std::string("com.example.app") + std::to_string(k); a.label = names[k]; a.apk = k < 3 || k == 8; a.vr = k == 9;
        a.rgba.assign((size_t)kAppTile * kAppTile * 4, 0);
        int is = kAppTile * 9 / 16, x0 = (kAppTile - is) / 2, y0 = kAppTile / 22; Vec3 c = rgb(cols[k]);
        for (int y = 0; y < kAppTile; y++) for (int x = 0; x < kAppTile; x++) {
            uint8_t* p = &a.rgba[((size_t)y * kAppTile + x) * 4];
            float dx = std::max(std::max(x0 + 24 - x, x - (x0 + is - 24)), 0), dy = std::max(std::max(y0 + 24 - y, y - (y0 + is - 24)), 0);
            bool icon = x >= x0 && x < x0 + is && y >= y0 && y < y0 + is && dx * dx + dy * dy < 24 * 24;
            bool label = y > y0 + is + 14 && y < y0 + is + 40 && x > 40 && x < kAppTile - 40;
            bool badge = a.apk && x > kAppTile * 0.71f && x < kAppTile * 0.98f && y > kAppTile * 0.02f && y < kAppTile * 0.14f;
            if (badge) { p[0] = 242; p[1] = 184; p[2] = 75; p[3] = 255; }
            else if (icon) { p[0] = (uint8_t)(c.x * 255); p[1] = (uint8_t)(c.y * 255); p[2] = (uint8_t)(c.z * 255); p[3] = 255; }
            else if (label) { p[0] = p[1] = p[2] = 235; p[3] = 255; }
        }
        out.push_back(std::move(a));
    }
    return true;
}
// seat monitor stand-ins: --helper 1 pretends the adb helper runs and shows a test picture on the monitor
static int gFakeHelper = 0;
int platformHelperState() { return gFakeHelper; }
int platformMonitorOpen(unsigned tex, int w, int h, int) {
    if (!gFakeHelper) return -1;
    std::vector<uint8_t> px((size_t)w * h * 4);
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {      // a made-up app: blue title bar, cards, a red marker top-left
        uint8_t* p = &px[((size_t)y * w + x) * 4]; int r = 245, g = 246, b = 248;
        if (y < 90) { r = 32; g = 92; b = 200; }
        else if (((x - 40) % 400) < 360 && ((y - 130) % 280) < 240 && x > 40 && y > 130) { r = 220; g = 226; b = 236; if (((y - 130) % 280) < 140) { r = 120 + (x % 400) / 4; g = 150; b = 190; } }
        if (x < 120 && y < 90) { r = 230; g = 60; b = 50; }
        p[0] = (uint8_t)r; p[1] = (uint8_t)g; p[2] = (uint8_t)b; p[3] = 255;
    }
    glBindTexture(GL_TEXTURE_2D, tex);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, px.data());
    return 7;
}
static int gFakeHS = HS_SETUP;
int platformHelperStatus(std::string& message) {
    if (gFakeHelper) return HS_OK;
    message = gFakeHS == HS_FAILED ? "헤드셋의 무선 디버깅에 연결하지 못했습니다. 처음 설정을 다시 해 주세요." : (gFakeHS == HS_STARTING ? "헤드셋에 연결하는 중…" : "");
    return gFakeHS;
}
void platformHelperAutoStart() {}
void platformOpenSetup() { LOGI("would open the setup panel"); }
bool platformMonitorLaunch(const std::string& pkg) { LOGI("monitor: launch %s", pkg.c_str()); return true; }
void platformMonitorTouch(int a, float x, float y) { LOGI("monitor: touch %d %.0f %.0f", a, x, y); }
void platformMonitorScroll(float, float, float) {}
void platformMonitorKey(int k) { LOGI("monitor: key %d", k); }
void platformMonitorClose() {}
bool platformMonitorUpdate(float m[16]) { for (int k = 0; k < 16; k++) m[k] = (k % 5 == 0) ? 1.f : 0.f; m[5] = -1; m[13] = 1; return gFakeHelper != 0; }
bool platformLaunchApp(const std::string& pkg, const std::string&, const std::string& text) { LOGI("would launch %s (%s)", pkg.c_str(), text.c_str()); return true; }

static Quat quatYawPitch(float yaw, float pitch) {
    float cy = cosf(yaw / 2), sy = sinf(yaw / 2), cp = cosf(pitch / 2), sp = sinf(pitch / 2);
    return Quat{cy * sp, sy * cp, -sy * sp, cy * cp};      // yaw about Y, then pitch about local X
}
int main(int argc, char** argv) {
    double km = 60; float yaw = 0, pitch = 0, clock = 14, scale = 1, fov = 100; int W = 1280, H = 1280, mono = 1, month = 11, frames = 0; std::string out = "/tmp/shot.png"; int phase = PH_RIDE;
    float ex = 0, ey = 0, ez = 0; float cloud = 0.35f; int both = 0; int seatArg = 0, busArg = 1, hudArg = 0, menuArg = 0, simulate = 0, appsPage = -1, monArg = -1; double awayMin = -1;
    for (int i = 1; i + 1 < argc; i += 2) {
        std::string k = argv[i]; const char* v = argv[i + 1];
        if (k == "--km") km = atof(v); else if (k == "--yaw") yaw = atof(v); else if (k == "--pitch") pitch = atof(v); else if (k == "--clock") clock = atof(v);
        else if (k == "--out") out = v; else if (k == "--w") W = atoi(v); else if (k == "--h") H = atoi(v); else if (k == "--fov") fov = atof(v);
        else if (k == "--month") month = atoi(v); else if (k == "--assets") gAssetDir = v; else if (k == "--frames") frames = atoi(v); else if (k == "--scale") scale = atof(v);
        else if (k == "--ex") ex = atof(v); else if (k == "--ey") ey = atof(v); else if (k == "--ez") ez = atof(v); else if (k == "--cloud") cloud = atof(v);
        else if (k == "--phase") phase = atoi(v); else if (k == "--seat") seatArg = atoi(v); else if (k == "--bus") busArg = atoi(v); else if (k == "--hud") hudArg = atoi(v); else if (k == "--simulate") simulate = atoi(v); else if (k == "--away") awayMin = atof(v); else if (k == "--apps") appsPage = atoi(v); else if (k == "--helper") gFakeHelper = atoi(v); else if (k == "--hs") gFakeHS = atoi(v); else if (k == "--monitor") monArg = atoi(v); else if (k == "--menu") menuArg = atoi(v); else if (k == "--both") both = atoi(v);
    }
    EGLDisplay dpy = eglGetPlatformDisplay(EGL_PLATFORM_SURFACELESS_MESA, EGL_DEFAULT_DISPLAY, nullptr);
    EGLint ma, mi; if (!eglInitialize(dpy, &ma, &mi)) { LOGE("egl init failed"); return 1; }
    eglBindAPI(EGL_OPENGL_ES_API);
    EGLint ca[] = {EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT, EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8, EGL_NONE};
    EGLConfig cfg; EGLint n; eglChooseConfig(dpy, ca, &cfg, 1, &n);
    EGLint xa[] = {EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE}; EGLContext ctx = eglCreateContext(dpy, cfg, EGL_NO_CONTEXT, xa);
    EGLint pa[] = {EGL_WIDTH, 16, EGL_HEIGHT, 16, EGL_NONE}; EGLSurface surf = eglCreatePbufferSurface(dpy, cfg, pa);
    if (!eglMakeCurrent(dpy, surf, surf, ctx)) { LOGE("make current failed"); return 1; }

    App app; app.seat = seatArg; app.showBus = busArg != 0; app.nowClock = clock; app.autoRecenter = false; app.allowAutoResume = false;
    if (!app.init()) { LOGE("app init failed"); return 1; }
    app.month = month; app.dayOfYear = (month - 1) * 30 + 15; app.env.cloud = cloud; app.hud = hudArg != 0;
    if (phase == PH_RIDE) { app.startTrip(false); app.annDepart = true; app.menuOpen = menuArg != 0; }
    app.phase = phase; app.s = km * 1000.0; app.departClock = clock; app.timeScale = scale;
    const Route& R = app.world.d.route;
    app.nextStop = 0; while (app.nextStop < (int)R.stops.size() && R.stops[app.nextStop].s <= app.s) app.nextStop++;
    if (simulate) {       // run the whole timetable without drawing: checks the trip really takes 4 h 15 min and never stalls
        app.s = 0; app.tripTime = 0; app.nextStop = 0; app.phase = PH_RIDE; app.timeScale = 1; double lastReport = 0; float vmax = 0;
        while (app.phase == PH_RIDE && app.tripTime < 6 * 3600) {
            app.advance(0.2); vmax = std::max(vmax, app.speed);
            if (app.tripTime - lastReport >= 1800) { lastReport = app.tripTime; LOGI("t=%5.0fs  s=%6.1fkm  v=%5.1fkm/h dwell=%.0f  %s", app.tripTime, app.s / 1000, app.speed * 3.6, app.dwellLeft, R.regionAt(app.s)); }
        }
        LOGI("ARRIVED phase=%d trip=%.1fs (%.2f min) vmax=%.1fkm/h", app.phase, app.tripTime, app.tripTime / 60, vmax * 3.6);
        app.shutdown(); return 0;
    }
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
    if (appsPage >= 0) {      // open the app page
        app.menuOpen = true; app.menuPage = 1; app.appsPage = appsPage; app.requestApps();
        while (app.appsLoading) { app.pollApps(); std::this_thread::sleep_for(std::chrono::milliseconds(5)); }
        app.update(in, true); app.hover = 100 + 1; app.buildMenu();
    }
    if (awayMin >= 0) {       // pretend the rider left through the app page this many minutes ago
        app.awayViaLauncher = true; app.suspendWall = platformWallClock() - awayMin * 60.0;
        bool moved = app.onWake();
        LOGI("away %.0f min -> moved=%d now %.1f km phase=%d banner=%s", awayMin, moved, app.s / 1000, app.phase, app.banner.c_str());
        app.update(in, true);
    }
    if (monArg >= 0) {        // seat monitor: 0 app list, 1 an app running, 2 helper instructions
        app.menuOpen = false; app.monShown = true; app.requestApps();
        while (app.appsLoading) { app.pollApps(); std::this_thread::sleep_for(std::chrono::milliseconds(5)); }
        app.monHelperCheck = -100; app.update(in, true);
        if (monArg == 1) app.monOpenApp(app.monApps().empty() ? 0 : app.monApps()[1]);
        if (monArg == 2) { app.monPick = 0; app.monMode = 2; }
        app.update(in, true);
        app.monHover = monArg == 1 ? 2 : 100 + 1; app.monBuild();
    }
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
