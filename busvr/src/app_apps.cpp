// Using the headset's other apps during the ride.
// Quest does not let one app show another app's window inside it, so the bus hands over to the chosen app
// and keeps driving on the real clock; when the rider comes back the trip continues from wherever the bus has got to.
#include "app.h"

enum { B_APPS_BACK = 60, B_APPS_PREV, B_APPS_NEXT, B_APPS_FILTER, B_APP0 = 100 };
static const int kCols = 5, kRows = 2, kPerPage = kCols * kRows;
static const double kShortBreak = 600.0;          // other pauses: the bus keeps going for up to 10 minutes, then waits
static const double kLongestAway = 12 * 3600.0;   // after this the trip is not caught up any more

void App::requestApps() {
    if (appsLoading) return;
    if (timeSec - appsLoadedAt < 30.0) return;
    if (appsThread.joinable()) appsThread.join();
    appsLoading = true;
    appsThread = std::thread([this]() {
        std::vector<AppEntry> v;
        platformListApps(v);
        std::lock_guard<std::mutex> lk(appsMtx);
        appsIncoming = std::move(v); appsArrived = true;
    });
}

void App::pollApps() {
    {
        std::lock_guard<std::mutex> lk(appsMtx);
        if (!appsArrived) return;
        apps = std::move(appsIncoming); appsIncoming.clear(); appsArrived = false;
    }
    if (appsThread.joinable()) appsThread.join();
    appsLoading = false; appsLoadedAt = timeSec;
    if (apps.size() > 200) apps.resize(200);
    if (appsTex) { glDeleteTextures(1, &appsTex); appsTex = 0; }
    if (!apps.empty()) {
        int layers = (int)apps.size(), levels = 1;
        for (int sz = kAppTile; sz > 1; sz >>= 1) levels++;
        glGenTextures(1, &appsTex);
        glBindTexture(GL_TEXTURE_2D_ARRAY, appsTex);
        glTexStorage3D(GL_TEXTURE_2D_ARRAY, levels, GL_SRGB8_ALPHA8, kAppTile, kAppTile, layers);
        glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
        for (int k = 0; k < layers; k++) {
            if (apps[k].rgba.size() == (size_t)kAppTile * kAppTile * 4)
                glTexSubImage3D(GL_TEXTURE_2D_ARRAY, 0, 0, 0, k, kAppTile, kAppTile, 1, GL_RGBA, GL_UNSIGNED_BYTE, apps[k].rgba.data());
            std::vector<uint8_t>().swap(apps[k].rgba);
        }
        glGenerateMipmap(GL_TEXTURE_2D_ARRAY);
        glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    }
    int pages = std::max(1, ((int)visibleApps().size() + kPerPage - 1) / kPerPage);
    appsPage = std::min(appsPage, pages - 1);
    LOGI("apps: %zu listed", apps.size());
}

std::vector<int> App::visibleApps() const {
    std::vector<int> v;
    for (int k = 0; k < (int)apps.size(); k++) if (!appsOnlyApk || apps[k].apk) v.push_back(k);
    return v;
}

void App::openOtherApp(int index) {
    if (index < 0 || index >= (int)apps.size()) return;
    char text[160];
    if (phase == PH_RIDE) {
        awayViaLauncher = true;
        writeSave(2);
        double rem = remainingSeconds(); double eta = fmod(clockNow() + rem / 3600.0 + 48.0, 24.0);
        int m = (int)floor(eta * 60.0 + 0.5) % 1440;
        snprintf(text, sizeof(text), "부산 도착 예정 %02d:%02d · 눌러서 버스로 돌아가기", m / 60, m % 60);
    } else snprintf(text, sizeof(text), "눌러서 버스로 돌아가기");
    if (platformLaunchApp(apps[index].pkg, "고속버스 운행 중", text)) {
        announce(phase == PH_RIDE ? "앱을 여는 동안에도 버스는 계속 달립니다." : "앱을 여는 중입니다.", 8, false);
        menuOpen = phase != PH_RIDE; menuPage = 0;
    } else {
        awayViaLauncher = false;
        announce("이 앱은 열 수 없습니다.", 6, false);
    }
}

void App::onSuspend() {
    suspendWall = platformWallClock();
    if (phase == PH_RIDE) writeSave(awayViaLauncher ? 2 : 1);
}

void App::catchUp(double seconds, bool viaLauncher) {
    const Route& R = world.d.route;
    double s0 = s;
    advance(seconds);
    cars.clear();
    env.tunnel = R.attr(R.wTunnel, s);
    int minutes = (int)lround(seconds / 60.0);
    char buf[200];
    if (phase == PH_ARRIVED) snprintf(buf, sizeof(buf), "자리를 비운 동안 부산에 도착했습니다. 이용해 주셔서 감사합니다.");
    else if (s - s0 < 100.0) snprintf(buf, sizeof(buf), "다시 오셨습니다. 버스는 계속 부산으로 가고 있습니다.");
    else snprintf(buf, sizeof(buf), "자리를 비운 %d분 동안 버스가 %.0fkm 달렸습니다. 지금은 %s 부근입니다.", std::max(minutes, 1), (s - s0) / 1000.0, R.regionAt(s));
    announce(buf, 25, true);
    LOGI("caught up %.0f s (%s): %.1f km -> %.1f km", seconds, viaLauncher ? "app launcher" : "pause", s0 / 1000, s / 1000);
    dirty = true;
}

bool App::onWake() {
    double gone = suspendWall > 0 ? platformWallClock() - suspendWall : 0;
    bool via = awayViaLauncher;
    suspendWall = 0; awayViaLauncher = false;
    if (phase != PH_RIDE || gone < 1.5) return false;
    if (gone > (via ? kLongestAway : kShortBreak)) return false;        // a long break without "다른 앱 쓰기": the bus waited
    double s0 = s;
    catchUp(gone, via);
    return fabs(s - s0) > 200.0;
}

bool App::tryAutoResume() {
    if (!allowAutoResume || !hasSave || saved.away <= 0 || saved.wall <= 0) return false;
    double gone = platformWallClock() - saved.wall;
    if (gone < 0 || gone > (saved.away == 2 ? kLongestAway : kShortBreak)) return false;
    startTrip(true);
    annDepart = true;
    catchUp(gone, saved.away == 2);
    return true;
}

void App::buildAppsPage(MeshData& bg, MeshData& tx, MeshData& icons) {
    static const Vec3 kPanelC(0.f, 0.02f, -0.62f); static const float kPanelS = 0.62f;
    auto P = [&](float x, float y, float z = 0) { return kPanelC + Vec3(x * kPanelS, y * kPanelS, z); };
    auto rect = [&](float x0, float y0, float x1, float y1, int col, int a, float z = 0) { bg.color(col, a); bg.quad(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)); };
    auto text = [&](const std::string& s2, float x, float y, float size, int col, int align = 1) { tx.color(col); font.draw(tx, s2.c_str(), P(x, y, 0.004f), Vec3(1, 0, 0), Vec3(0, 1, 0), size * kPanelS, align); };
    auto button = [&](int id, float x0, float y0, float x1, float y1, const std::string& label, float size, int base = 0x2b3b55) {
        bool hv = hover == id;
        rect(x0, y0, x1, y1, hv ? 0xf2b84b : base, 255, 0.002f);
        text(label, (x0 + x1) / 2, (y0 + y1) / 2 - size * 0.36f, size, hv ? 0x16130a : 0xffffff);
        buttons.push_back(Button{x0, y0, x1, y1, id});
    };
    text("다른 앱 쓰기", -0.45f, 0.255f, 0.05f, 0xffffff, 0);
    text(phase == PH_RIDE ? "앱을 열어도 버스는 실제 시간으로 계속 달립니다. 이 앱을 다시 열면 그동안 달린 곳에서 이어집니다."
                          : "고른 앱이 열립니다. 이 앱을 다시 열면 버스로 돌아옵니다.",
         -0.45f, 0.205f, 0.021f, 0x9fb0c8, 0);
    button(B_APPS_FILTER, 0.10f, 0.25f, 0.45f, 0.305f, appsOnlyApk ? "APK만 보는 중 · 전체 보기" : "전체 · 직접 설치한 APK만 보기", 0.021f, 0x25344c);
    std::vector<int> vis = visibleApps();
    int pages = std::max(1, ((int)vis.size() + kPerPage - 1) / kPerPage);
    appsPage = std::max(0, std::min(appsPage, pages - 1));
    if (appsLoading && apps.empty()) text("앱 목록을 불러오는 중…", 0, 0.0f, 0.04f, 0xc9d4e6);
    else if (vis.empty()) text(appsOnlyApk ? "직접 설치한 APK 앱이 없습니다." : "열 수 있는 앱이 없습니다.", 0, 0.0f, 0.036f, 0xc9d4e6);
    const float cw = 0.18f, ch = 0.19f, gx0 = -0.45f, gy0 = 0.175f;
    icons.mat = MAT_UITEX; icons.color(0xffffff, 255);
    for (int k = 0; k < kPerPage; k++) {
        int vi = appsPage * kPerPage + k;
        if (vi >= (int)vis.size()) break;
        int ai = vis[vi];
        int col = k % kCols, row = k / kCols;
        float x0 = gx0 + col * cw, y1 = gy0 - row * ch, x1 = x0 + cw - 0.01f, y0 = y1 - ch + 0.01f;
        int id = B_APP0 + ai;
        rect(x0, y0, x1, y1, hover == id ? 0x4a5f86 : 0x1a2638, 255, 0.002f);
        buttons.push_back(Button{x0, y0, x1, y1, id});
        if (appsTex) {
            float side = std::min(x1 - x0, y1 - y0) - 0.012f, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
            icons.layer = (float)ai;
            // texture row 0 is the top of the tile
            icons.quad(P(cx - side / 2, cy - side / 2, 0.003f), P(cx + side / 2, cy - side / 2, 0.003f), P(cx + side / 2, cy + side / 2, 0.003f), P(cx - side / 2, cy + side / 2, 0.003f), 0, 1, 1, 0);
        }
    }
    char buf[64];
    snprintf(buf, sizeof(buf), "%d / %d 쪽 · %d개", appsPage + 1, pages, (int)vis.size());
    text(buf, 0, -0.248f, 0.024f, 0x9fb0c8);
    button(B_APPS_PREV, -0.45f, -0.30f, -0.27f, -0.225f, "◀ 이전", 0.028f);
    button(B_APPS_NEXT, 0.27f, -0.30f, 0.45f, -0.225f, "다음 ▶", 0.028f);
    button(B_APPS_BACK, -0.12f, -0.345f, 0.12f, -0.29f, "돌아가기", 0.026f, 0x35507a);
}

// clicks that belong to the app page; returns true when handled
bool appsClick(App& a, int id) {
    if (id == B_APPS_BACK) { a.menuPage = 0; return true; }
    if (id == B_APPS_FILTER) { a.appsOnlyApk = !a.appsOnlyApk; a.appsPage = 0; return true; }
    int pages = std::max(1, ((int)a.visibleApps().size() + kPerPage - 1) / kPerPage);
    if (id == B_APPS_PREV) { a.appsPage = (a.appsPage + pages - 1) % pages; return true; }
    if (id == B_APPS_NEXT) { a.appsPage = (a.appsPage + 1) % pages; return true; }
    if (id >= B_APP0) { a.openOtherApp(id - B_APP0); return true; }
    return false;
}
