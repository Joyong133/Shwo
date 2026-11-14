// The seat monitor: a screen fixed in front of the rider's seat that runs the headset's own 2D apps (APKs).
// Quest lets no ordinary app show another app inside itself, so a small helper started from adb (SeatHelper.java,
// running with the shell user's rights) opens the APK on a virtual display that draws straight into this monitor's texture
// and passes the rider's touches on to it.
#include "app.h"
#include <thread>

namespace {
// geometry in the seat frame (origin = the seat's resting eye point, -Z = towards the front of the bus)
const Vec3 kMonC(0.f, -0.17f, -0.70f);
const float kMonW = 0.56f, kMonH = 0.315f, kBarH = 0.052f, kTilt = 0.21f;
const int kPixW = 1280, kPixH = 720, kDpi = 200;
const Vec3 kRight(1, 0, 0);
Vec3 monUp() { return Vec3(0, cosf(kTilt), -sinf(kTilt)); }
Vec3 monN() { return Vec3(0, sinf(kTilt), cosf(kTilt)); }
// (u, v): u 0..1 left to right, v 0..1 bottom to top of the picture; v < 0 is the button bar under it
Vec3 monP(float u, float v, float lift = 0) { return kMonC + kRight * ((u - 0.5f) * kMonW) + monUp() * ((v - 0.5f) * kMonH) + monN() * lift; }
const float kBarV = -kBarH / kMonH;
enum { M_BACK = 1, M_HOME, M_CLOSE, M_PREV, M_NEXT, M_FILTER, M_HELP, M_HELPBACK, M_QUEST, M_SETUP, M_RETRY, M_APP0 = 100 };
const int kCols = 5, kRows = 2, kPer = kCols * kRows;
const char* kHelperCmd = "adb shell sh /sdcard/Android/data/kr.busvr.seoulbusan/files/start.sh";

const char* kScreenVS = R"(
in vec3 aPos; in vec3 aUv;
uniform mat4 uModel; uniform mat4 uTexMat;
out vec2 vUv;
void main(){ gl_Position = uViewProj[VIEW] * (uModel * vec4(aPos, 1.0)); vUv = (uTexMat * vec4(aUv.xy, 0.0, 1.0)).xy; }
)";
const char* kScreenFS = R"(
#ifdef EXTERNAL
uniform samplerExternalOES uScreen;
#else
uniform sampler2D uScreen;
#endif
in vec2 vUv; out vec4 oColor;
void main(){ vec3 c = texture(uScreen, vUv).rgb; oColor = vec4(pow(c, vec3(2.2)) * 0.9, 1.0); }
)";

bool monHit(const Vec3& o, const Vec3& d, float& u, float& v, float& t) {
    Vec3 n = monN(); float dn = dot(d, n);
    if (dn > -0.05f) return false;
    t = dot(kMonC - o, n) / dn;
    if (t < 0.02f || t > 3.f) return false;
    Vec3 p = o + d * t - kMonC;
    u = dot(p, kRight) / kMonW + 0.5f; v = dot(p, monUp()) / kMonH + 0.5f;
    return u >= -0.03f && u <= 1.03f && v >= kBarV - 0.03f && v <= 1.03f;
}
}  // namespace

void App::monInit() {
    for (int k = 0; k < 16; k++) monMat[k] = (k % 5 == 0) ? 1.f : 0.f;
    monMat[5] = -1.f; monMat[13] = 1.f;                     // the usual SurfaceTexture flip until a real matrix arrives
#ifdef __ANDROID__
    monShader.build("monitor", kScreenVS, kScreenFS, "#extension GL_OES_EGL_image_external_essl3 : require\n#define EXTERNAL 1\n");
    const GLenum target = GL_TEXTURE_EXTERNAL_OES;
#else
    monShader.build("monitor", kScreenVS, kScreenFS);
    const GLenum target = GL_TEXTURE_2D;
#endif
    glGenTextures(1, &monTex);
    glBindTexture(target, monTex);
    glTexParameteri(target, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(target, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(target, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(target, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    // the monitor body: bezel with a button strip under the picture, and a bracket to the seat in front
    MeshData m; m.mat = MAT_CABIN; m.layer = -1;
    Mat4 M = Mat4::basis(kRight, monUp(), monN(), kMonC);
    m.color(0x1b1d21);
    m.roundBox(M, Vec3(-kMonW / 2 - 0.014f, -kMonH / 2 - kBarH - 0.010f, -0.030f), Vec3(kMonW / 2 + 0.014f, kMonH / 2 + 0.014f, -0.002f), 0.008f, 1);
    m.color(0x3a3d43);
    m.box(Mat4::identity(), Vec3(-0.035f, -0.135f, -0.83f), Vec3(0.035f, -0.095f, -0.712f));
    m.box(Mat4::identity(), Vec3(-0.12f, -0.16f, -0.85f), Vec3(0.12f, -0.07f, -0.825f));
    monFrameMesh.upload(m);
    MeshData q; q.mat = MAT_UI; q.layer = -1; q.color(0xffffff);
    q.quad(monP(0, 0), monP(1, 0), monP(1, 1), monP(0, 1), 0, 0, 1, 1);
    monQuad.upload(q);
}

std::vector<int> App::monApps() const {
    std::vector<int> v;
    for (int k = 0; k < (int)apps.size(); k++) if (!apps[k].vr && (!monOnlyApk || apps[k].apk)) v.push_back(k);
    return v;
}

void App::monOpenApp(int ai) {
    if (ai < 0 || ai >= (int)apps.size()) return;
    monPick = ai;
    if (monHelper != 1) { monMode = 2; if (monHS == HS_FAILED || monHS == HS_IDLE) { platformHelperAutoStart(); monAutoT = timeSec; } return; }
    if (monDisplay < 0) monDisplay = platformMonitorOpen(monTex, kPixW, kPixH, kDpi);
    if (monDisplay < 0) { monNote = "모니터 화면을 만들지 못했습니다. 도우미를 다시 켜 주세요."; monNoteUntil = timeSec + 8; monMode = 2; return; }
    std::string pkg = apps[ai].pkg;
    std::thread([pkg]() { platformMonitorLaunch(pkg); }).detach();       // the helper restarts the app on the monitor: takes a moment
    monMode = 1; monFrame = false;
    monNote = "앱을 여는 중…"; monNoteUntil = timeSec + 4;
}

void App::monClick(int id) {
    audio.trigger(AE_TICK);
    std::vector<int> list = monApps();
    int pages = std::max(1, ((int)list.size() + kPer - 1) / kPer);
    switch (id) {
        case M_BACK: platformMonitorKey(4); break;                         // KEYCODE_BACK
        case M_HOME: monMode = 0; requestApps(); break;
        case M_CLOSE: platformMonitorClose(); monDisplay = -1; monMode = 0; monFrame = false; break;
        case M_PREV: monPage = (monPage + pages - 1) % pages; break;
        case M_NEXT: monPage = (monPage + 1) % pages; break;
        case M_FILTER: monOnlyApk = !monOnlyApk; monPage = 0; break;
        case M_HELP: monMode = 2; break;
        case M_HELPBACK: monMode = 0; break;
        case M_QUEST: if (monPick >= 0) openOtherApp(monPick); monMode = 0; break;
        case M_SETUP: platformOpenSetup(); break;
        case M_RETRY: platformHelperAutoStart(); monAutoT = timeSec; monHS = HS_STARTING; break;
        default: if (id >= M_APP0) monOpenApp(id - M_APP0); break;
    }
}

// per frame, called from update(): helper status and the newest picture
void App::monTick() {
    if (timeSec - monHelperCheck > 2.0) {
        monHelperCheck = timeSec;
        int h = platformHelperState();
        if (h != 1 && monHelper == 1) {
            monDisplay = -1; monFrame = false;
            if (monMode == 1) { monMode = 0; monNote = "모니터 도우미가 꺼졌습니다."; monNoteUntil = timeSec + 8; }
        }
        if (h == 1 && monHelper != 1 && monMode == 2) monMode = 0;
        monHelper = h;
        monHS = platformHelperStatus(monHSMsg);
        // switch the helper on by ourselves (no PC): right away, then retry now and then if it failed
        if (h != 1 && (monHS == HS_IDLE || monHS == HS_FAILED) && timeSec - monAutoT > (monHS == HS_FAILED ? 90.0 : 2.0)) {
            monAutoT = timeSec; platformHelperAutoStart();
        }
    }
    if (monShown && phase == PH_RIDE) requestApps();
    if (monMode == 1 && monDisplay >= 0) monFrame = platformMonitorUpdate(monMat);
}

// pointing at the monitor: taps, drags, scrolling with the stick, and the buttons
void App::monInput(const AppInput& in) {
    float hu[2], hv[2], ht[2]; bool hit[2];
    for (int h = 0; h < 2; h++) {
        hit[h] = rayOn[h] && monHit(rayO[h], rayD[h], hu[h], hv[h], ht[h]);
        monRayLen[h] = hit[h] ? ht[h] : -1.f;
    }
    bool trig[2] = {in.hand[0].trigger > 0.55f, in.hand[1].trigger > 0.55f};
    int hand = -1;
    if (monTouching && monTouchHand >= 0) hand = monTouchHand;
    else for (int h = 0; h < 2; h++) if (hit[h] && (hand < 0 || (trig[h] && !trig[hand]))) hand = h;
    monHover = -1;
    if (hand >= 0 && hit[hand]) for (const Button& b : monButtons) if (hu[hand] >= b.x0 && hu[hand] <= b.x1 && hv[hand] >= b.y0 && hv[hand] <= b.y1) monHover = b.id;
    bool appOn = monMode == 1 && monDisplay >= 0;
    if (appOn && hand >= 0) {
        bool inPic = hit[hand] && hu[hand] >= 0 && hu[hand] <= 1 && hv[hand] >= 0 && hv[hand] <= 1;
        float x = clampf(hu[hand], 0, 1) * kPixW, y = (1.f - clampf(hv[hand], 0, 1)) * kPixH;
        if (!monTouching && trig[hand] && !monPrevTrig[hand] && inPic) {
            monTouching = true; monTouchHand = hand; monTX = x; monTY = y; platformMonitorTouch(0, x, y);
        } else if (monTouching) {
            if (!trig[hand] || !rayOn[hand]) { platformMonitorTouch(1, monTX, monTY); monTouching = false; monTouchHand = -1; }
            else if (hit[hand] && (fabsf(x - monTX) > 0.5f || fabsf(y - monTY) > 0.5f)) { monTX = x; monTY = y; platformMonitorTouch(2, x, y); }
        }
        // thumbstick up / down scrolls whatever is under the pointer
        float sy = in.hand[hand].stickY;
        if (inPic && !monTouching && fabsf(sy) > 0.25f) {
            monScrollAcc += sy * (float)in.dt * 9.f;
            while (fabsf(monScrollAcc) >= 1.f) { float s1 = monScrollAcc > 0 ? 1.f : -1.f; platformMonitorScroll(x, y, s1); monScrollAcc -= s1; }
        } else monScrollAcc = 0;
    } else if (monTouching) { platformMonitorTouch(1, monTX, monTY); monTouching = false; monTouchHand = -1; }
    // buttons (the strip under the picture, and everything on our own pages)
    if (hand >= 0 && monHover >= 0 && trig[hand] && !monPrevTrig[hand] && !monTouching) monClick(monHover);
    monPrevTrig[0] = trig[0]; monPrevTrig[1] = trig[1];
}

void App::monBuild() {
    const Route& R = world.d.route;
    MeshData bg, tx, ic; bg.mat = MAT_UI; bg.layer = -1; tx.mat = MAT_CABIN; ic.mat = MAT_UITEX;
    monButtons.clear();
    Vec3 up = monUp();
    auto rect = [&](float u0, float v0, float u1, float v1, int col, int a, float lift) { bg.color(col, a); bg.quad(monP(u0, v0, lift), monP(u1, v0, lift), monP(u1, v1, lift), monP(u0, v1, lift)); };
    auto text = [&](const std::string& s2, float u, float v, float size, int col, int align = 0) {
        tx.color(col); font.draw(tx, s2.c_str(), monP(u, v, 0.004f), kRight, up, size, align);
    };
    auto fit = [&](const std::string& s2, float size, float maxU) { return std::min(size, maxU * kMonW / std::max(font.width(s2.c_str(), 1.f), 0.01f)); };
    auto button = [&](int id, float u0, float v0, float u1, float v1, const std::string& label, float size, int base) {
        bool hv = monHover == id;
        rect(u0, v0, u1, v1, hv ? 0xf2b84b : base, 255, 0.002f);
        float sz = fit(label, size, (u1 - u0) * 0.9f);
        text(label, (u0 + u1) / 2, (v0 + v1) / 2 - sz * 0.36f / kMonH, sz, hv ? 0x16130a : 0xffffff, 1);
        monButtons.push_back(Button{u0, v0, u1, v1, id});
    };
    char buf[200];
    bool appOn = monMode == 1 && monDisplay >= 0;
    // ---- button strip under the picture
    if (appOn) {
        button(M_BACK, 0.02f, kBarV + 0.02f, 0.30f, -0.02f, "◀ 뒤로", 0.016f, 0x2b3b55);
        button(M_HOME, 0.36f, kBarV + 0.02f, 0.64f, -0.02f, "앱 목록", 0.016f, 0x2b3b55);
        button(M_CLOSE, 0.70f, kBarV + 0.02f, 0.98f, -0.02f, "× 앱 닫기", 0.016f, 0x5a3434);
    } else {
        text("A/X 버튼: 모니터 접기 · 펴기", 0.5f, kBarV * 0.5f - 0.02f, 0.010f, 0x8090a8, 1);
    }
    if (appOn) {
        if (!monFrame) { rect(0, 0, 1, 1, 0x05080e, 255, 0.001f); text("앱을 여는 중…", 0.5f, 0.48f, 0.02f, 0xc9d4e6, 1); }
    } else if (monMode == 2) {
        rect(0, 0, 1, 1, 0x0b1424, 255, 0.001f);
        if (monHS == HS_SETUP) {
            text("이 모니터에서 APK를 쓰려면 (처음 한 번만)", 0.04f, 0.87f, 0.019f, 0xffffff);
            text("헤드셋 안에서 한 번만 연결을 허락해 두면, 다음부터는 버스 앱이 혼자 모니터를 켭니다. PC는 필요 없습니다.", 0.04f, 0.785f, fit("헤드셋 안에서 한 번만 연결을 허락해 두면, 다음부터는 버스 앱이 혼자 모니터를 켭니다. PC는 필요 없습니다.", 0.0112f, 0.92f), 0xc9d4e6);
            text("1. 아래 '설정 열기'를 누르면 무선 디버깅 화면과 설정 창이 바로 열립니다 (잠깐 버스 밖 화면).", 0.04f, 0.70f, fit("1. 아래 '설정 열기'를 누르면 무선 디버깅 화면과 설정 창이 바로 열립니다 (잠깐 버스 밖 화면).", 0.0105f, 0.92f), 0xb9c8e0);
            text("2. 무선 디버깅 스위치를 켜고 '페어링 코드로 기기 페어링'을 누릅니다.", 0.04f, 0.63f, 0.0105f, 0xb9c8e0);
            text("3. 나온 6자리 숫자를 '좌석 모니터 설정' 창에 넣고 '연결하기' → '버스로 돌아가기'.", 0.04f, 0.56f, 0.0105f, 0xb9c8e0);
            text("Wi-Fi가 켜져 있어야 합니다. 이 과정은 다시 할 필요가 없습니다.", 0.04f, 0.49f, 0.0100f, 0x8f9db5);
            button(M_SETUP, 0.04f, 0.31f, 0.60f, 0.43f, "설정 열기 (처음 한 번)", 0.016f, 0x2f6f4a);
            text("PC가 있으면 대신:", 0.64f, 0.385f, 0.0085f, 0x8f9db5);
            text("adb shell sh /sdcard/Android/", 0.64f, 0.355f, 0.0075f, 0x8f9db5);
            text("data/kr.busvr.seoulbusan/files/start.sh", 0.64f, 0.33f, 0.0075f, 0x8f9db5);
        } else {
            text(monHS == HS_STARTING ? "모니터 도우미를 켜는 중…" : "모니터 도우미를 켜지 못했습니다", 0.04f, 0.87f, 0.019f, 0xffffff);
            std::string msg = monHSMsg.empty() ? std::string("잠시 기다려 주세요.") : monHSMsg;
            text(msg, 0.04f, 0.77f, fit(msg, 0.0120f, 0.92f), monHS == HS_FAILED ? 0xffb020 : 0xc9d4e6);
            text("버스 앱이 헤드셋의 무선 디버깅에 잠깐 연결해 도우미를 켭니다. Wi-Fi가 켜져 있어야 합니다.", 0.04f, 0.66f, fit("버스 앱이 헤드셋의 무선 디버깅에 잠깐 연결해 도우미를 켭니다. Wi-Fi가 켜져 있어야 합니다.", 0.0105f, 0.92f), 0xb9c8e0);
            if (monHS == HS_FAILED) {
                button(M_RETRY, 0.04f, 0.42f, 0.48f, 0.54f, "다시 시도", 0.016f, 0x2f6f4a);
                button(M_SETUP, 0.52f, 0.42f, 0.96f, 0.54f, "처음 설정 다시 하기", 0.014f, 0x35507a);
            }
        }
        button(M_HELPBACK, 0.04f, 0.04f, 0.34f, 0.14f, "돌아가기", 0.015f, 0x35507a);
        if (monPick >= 0) button(M_QUEST, 0.60f, 0.04f, 0.96f, 0.14f, "Quest 화면에서 열기", 0.012f, 0x2b3b55);
    } else {
        // ---- app list
        rect(0, 0, 1, 1, 0x0b1424, 255, 0.001f);
        text("좌석 모니터", 0.03f, 0.885f, 0.019f, 0xffffff);
        if (monHelper == 1) text("● APK 실행 준비됨", 0.97f, 0.89f, 0.011f, 0x58e06a, 2);
        else if (monHS == HS_STARTING) text("도우미 켜는 중…", 0.97f, 0.89f, 0.011f, 0xffd27a, 2);
        else if (monHS == HS_SETUP) button(M_HELP, 0.60f, 0.86f, 0.97f, 0.95f, "처음 한 번 설정하기", 0.011f, 0x2f6f4a);
        else button(M_HELP, 0.60f, 0.86f, 0.97f, 0.95f, "도우미 꺼짐 · 다시 켜기", 0.011f, 0x6a4a1c);
        double rem = remainingSeconds(); double eta = fmod(clockNow() + rem / 3600.0 + 48.0, 24.0); int em = (int)floor(eta * 60.0 + 0.5) % 1440;
        snprintf(buf, sizeof(buf), "%s · 부산까지 %dkm · 도착 예정 %02d:%02d", phase == PH_RIDE ? R.regionAt(s) : "서울", (int)((R.length() - s) / 1000), em / 60, em % 60);
        text(buf, 0.03f, 0.815f, 0.0105f, 0x8fd0ff);
        std::vector<int> list = monApps();
        int pages = std::max(1, ((int)list.size() + kPer - 1) / kPer);
        monPage = std::max(0, std::min(monPage, pages - 1));
        if (appsLoading && apps.empty()) text("앱 목록을 불러오는 중…", 0.5f, 0.48f, 0.016f, 0xc9d4e6, 1);
        else if (list.empty()) text(monOnlyApk ? "직접 설치한 2D APK 앱이 없습니다." : "모니터에서 열 수 있는 앱이 없습니다.", 0.5f, 0.48f, 0.015f, 0xc9d4e6, 1);
        const float cw = 0.188f, ch = 0.33f, u0 = 0.03f, vTop = 0.785f;
        for (int k = 0; k < kPer; k++) {
            int li = monPage * kPer + k; if (li >= (int)list.size()) break;
            int ai = list[li], col = k % kCols, row = k / kCols;
            float a0 = u0 + col * cw, a1 = a0 + cw - 0.012f, b1 = vTop - row * ch, b0 = b1 - ch + 0.02f;
            int id = M_APP0 + ai;
            rect(a0, b0, a1, b1, monHover == id ? 0x4a5f86 : 0x16233a, 255, 0.002f);
            monButtons.push_back(Button{a0, b0, a1, b1, id});
            if (appsTex) {
                float side = std::min((a1 - a0) * kMonW, (b1 - b0) * kMonH) - 0.006f;
                float cu = (a0 + a1) / 2, cv = (b0 + b1) / 2, hu = side / kMonW / 2, hv = side / kMonH / 2;
                ic.layer = (float)ai; ic.color(0xffffff, 255);
                ic.quad(monP(cu - hu, cv - hv, 0.003f), monP(cu + hu, cv - hv, 0.003f), monP(cu + hu, cv + hv, 0.003f), monP(cu - hu, cv + hv, 0.003f), 0, 1, 1, 0);
            }
        }
        button(M_PREV, 0.03f, 0.03f, 0.17f, 0.11f, "◀", 0.014f, 0x2b3b55);
        snprintf(buf, sizeof(buf), "%d / %d", monPage + 1, pages);
        text(buf, 0.24f, 0.055f, 0.011f, 0x9fb0c8, 1);
        button(M_NEXT, 0.31f, 0.03f, 0.45f, 0.11f, "▶", 0.014f, 0x2b3b55);
        button(M_FILTER, 0.55f, 0.03f, 0.97f, 0.11f, monOnlyApk ? "APK만 보는 중 · 전체 보기" : "직접 설치한 APK만 보기", 0.0115f, 0x25344c);
    }
    if (timeSec < monNoteUntil && !monNote.empty() && !(appOn && !monFrame)) {
        float sz = fit(monNote, 0.012f, 0.8f);
        rect(0.08f, 0.44f, 0.92f, 0.56f, 0x000000, 210, 0.005f);
        text(monNote, 0.5f, 0.48f, sz, 0xffe27a, 1);
    }
    if (bg.i.empty()) monBg.destroy(); else monBg.upload(bg, true);
    if (tx.i.empty()) monText.destroy(); else monText.upload(tx, true);
    if (ic.i.empty()) monIcons.destroy(); else monIcons.upload(ic, true);
}

void App::monDrawOpaque(const Mat4& seatWorld) {
    if (!monShown) return;
    ren.drawLit(monFrameMesh, seatWorld, ren.texInterior, 2.f);
    if (monMode == 1 && monDisplay >= 0 && monFrame) {
        monShader.use();
        monShader.setMat4("uModel", seatWorld);
        glUniformMatrix4fv(monShader.loc("uTexMat"), 1, GL_FALSE, monMat);
        glActiveTexture(GL_TEXTURE0);
#ifdef __ANDROID__
        glBindTexture(GL_TEXTURE_EXTERNAL_OES, monTex);
#else
        glBindTexture(GL_TEXTURE_2D, monTex);
#endif
        monShader.seti("uScreen", 0);
        monQuad.draw();
    }
}

void App::monDrawOverlay(const Mat4& seatWorld) {
    if (!monShown) return;
    ren.drawLit(monBg, seatWorld, ren.texInterior, 2.f);
    if (appsTex && monIcons.valid()) ren.drawLit(monIcons, seatWorld, appsTex, 1.f);
    ren.drawText(monText, seatWorld, font);
}
