// Menus, controller pointer, the in-bus displays and the save file.
#include "app.h"

static const float kDepartOptions[] = {-1.f, 6.5f, 8.f, 11.f, 14.f, 16.5f, 19.f, 22.f};
static const float kSpeedOptions[] = {1.f, 4.f, 16.f, 60.f};
static const char* kSpeedNames[] = {"실제 시간 (1배속)", "4배속", "16배속", "60배속 (미리보기)"};
static const char* kSeatNames[] = {"3번 · 맨 앞 1인석 (전면 시야)", "12번 · 가운데 1인석 (오른쪽 창)", "10번 · 가운데 왼쪽 창가", "1번 · 맨 앞 왼쪽 창가", "24번 · 뒤쪽 1인석 (오른쪽 창)"};
enum { B_DEP_L = 1, B_DEP_R, B_SEAT_L, B_SEAT_R, B_SPD_L, B_SPD_R, B_START, B_RESUME, B_CLOSE, B_END, B_HUD, B_RESTART, B_RECENTER };

static const Vec3 kPanelC(0.f, 0.02f, -0.62f); static const float kPanelS = 0.62f;
static const uint32_t SAVE_MAGIC = 0x31565342;

static std::string hhmm(double h) { h = fmod(h + 48.0, 24.0); int m = (int)floor(h * 60.0 + 0.5) % 1440; char b[16]; snprintf(b, sizeof(b), "%02d:%02d", m / 60, m % 60); return b; }

void App::loadSave() {
    hasSave = false;
    FILE* f = fopen(platformSavePath().c_str(), "rb"); if (!f) return;
    SaveData sd; size_t n = fread(&sd, 1, sizeof(sd), f); fclose(f);
    const Route& R = world.d.route;
    if (n == sizeof(sd) && sd.magic == SAVE_MAGIC && sd.s > 50.0 && sd.s < R.length() - 50.0 && sd.nextStop >= 0 && sd.nextStop <= (int)R.stops.size()) { saved = sd; hasSave = true; }
}
void App::writeSave() {
    SaveData sd; sd.magic = SAVE_MAGIC; sd.s = s; sd.tripTime = tripTime; sd.departClock = departClock; sd.dwellLeft = dwellLeft; sd.timeScale = timeScale;
    sd.nextStop = nextStop; sd.seat = seat; sd.month = month; sd.dayOfYear = dayOfYear;
    FILE* f = fopen(platformSavePath().c_str(), "wb"); if (!f) return;
    fwrite(&sd, 1, sizeof(sd), f); fclose(f); saved = sd; hasSave = true; dirty = false;
}
void App::clearSave() { remove(platformSavePath().c_str()); hasSave = false; }

void App::click(int id) {
    audio.trigger(AE_TICK);
    switch (id) {
        case B_DEP_L: departSel = (departSel + 7) % 8; break;
        case B_DEP_R: departSel = (departSel + 1) % 8; break;
        case B_SEAT_L: setSeat(seat - 1); break;
        case B_SEAT_R: setSeat(seat + 1); break;
        case B_SPD_L: speedSel = (speedSel + 3) % 4; if (phase == PH_RIDE) timeScale = kSpeedOptions[speedSel]; break;
        case B_SPD_R: speedSel = (speedSel + 1) % 4; if (phase == PH_RIDE) timeScale = kSpeedOptions[speedSel]; break;
        case B_START: clearSave(); recenter(lastIn); startTrip(false); break;
        case B_RESUME: recenter(lastIn); startTrip(true); break;
        case B_RECENTER: recenter(lastIn); break;
        case B_CLOSE: menuOpen = false; break;
        case B_HUD: hud = !hud; break;
        case B_END: writeSave(); phase = PH_MENU; s = 0; speed = 0; dwellLeft = 0; tripTime = 0; menuOpen = true; cars.clear(); break;
        case B_RESTART: phase = PH_MENU; s = 0; speed = 0; tripTime = 0; menuOpen = true; cars.clear(); break;
    }
}

void App::handleInput(const AppInput& in) {
    Mat4 yaw = seatFromLocal();
    bool anyHand = false;
    for (int h = 0; h < 2; h++) {
        rayOn[h] = in.hand[h].valid;
        if (rayOn[h]) { anyHand = true; rayO[h] = yaw.point(in.hand[h].pos); rayD[h] = yaw.dir(rotate(in.hand[h].rot, Vec3(0, 0, -1))); }
    }
    bool gaze = !anyHand;
    if (gaze) { rayO[0] = yaw.point((in.eye[0].pos + in.eye[1].pos) * 0.5f); rayD[0] = yaw.dir(rotate(in.eye[0].rot, Vec3(0, 0, -1))); }
    int newHover = -1; int hoverHand = -1;
    for (int h = 0; h < 2; h++) {
        rayLen[h] = 1.2f;
        if (!(rayOn[h] || (gaze && h == 0)) || !menuOpen) continue;
        if (rayD[h].z > -0.05f) continue;
        float t = (kPanelC.z - rayO[h].z) / rayD[h].z;
        if (t < 0.02f || t > 4.f) continue;
        Vec3 p = rayO[h] + rayD[h] * t; float px = (p.x - kPanelC.x) / kPanelS, py = (p.y - kPanelC.y) / kPanelS;
        if (fabsf(px) < 0.53f && fabsf(py) < 0.40f) rayLen[h] = t;
        for (const Button& b : buttons) if (px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1) { if (newHover < 0 || in.hand[h].trigger > 0.3f) { newHover = b.id; hoverHand = h; } }
    }
    if (newHover != hover) { hover = newHover; gazeT = 0; }
    bool trig[2] = {in.hand[0].trigger > 0.6f, in.hand[1].trigger > 0.6f};
    if (menuOpen && hover >= 0) {
        if (gaze) { gazeT += (float)in.dt; if (gazeT > 1.4f) { click(hover); gazeT = -0.9f; } }
        else if (hoverHand >= 0 && trig[hoverHand] && !prevTrig[hoverHand]) click(hover);
        else for (int h = 0; h < 2; h++) if (trig[h] && !prevTrig[h] && rayOn[h]) {      // the other hand pressed while it also points at a button
            float t = (kPanelC.z - rayO[h].z) / std::min(rayD[h].z, -0.05f); Vec3 p = rayO[h] + rayD[h] * t;
            float px = (p.x - kPanelC.x) / kPanelS, py = (p.y - kPanelC.y) / kPanelS;
            for (const Button& b : buttons) if (px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1) { click(b.id); break; }
        }
    }
    prevTrig[0] = trig[0]; prevTrig[1] = trig[1];
    bool a = in.hand[0].btnA || in.hand[1].btnA, b = in.hand[0].btnB || in.hand[1].btnB;
    if (a && !prevA) { hud = !hud; audio.trigger(AE_TICK); dispTimer = 1e9; }
    if (((b && !prevB) || (in.menu && !prevMenu)) && phase == PH_RIDE) { menuOpen = !menuOpen; audio.trigger(AE_TICK); }
    prevA = a; prevB = b; prevMenu = in.menu;
    float sx = fabsf(in.hand[0].stickX) > fabsf(in.hand[1].stickX) ? in.hand[0].stickX : in.hand[1].stickX;
    int st = sx > 0.7f ? 1 : (sx < -0.7f ? -1 : (fabsf(sx) < 0.3f ? 0 : prevStick));
    if (st != prevStick && st != 0) { seatYaw -= st * radf(30.f); if (seatYaw > PI) seatYaw -= 2 * PI; if (seatYaw < -PI) seatYaw += 2 * PI; }
    prevStick = st;
    if (phase != PH_RIDE) menuOpen = true;

    // pointer visuals (seat frame)
    MeshData pm; pm.mat = MAT_UI; pm.layer = -1;
    if (menuOpen) for (int h = 0; h < 2; h++) {
        if (!rayOn[h] && !(gaze && h == 0)) continue;
        Vec3 o = rayO[h], e = o + rayD[h] * rayLen[h];
        if (rayOn[h]) {
            Vec3 side = normalize(cross(rayD[h], Vec3(0, 1, 0))) * 0.0018f, upv = normalize(cross(side, rayD[h])) * 0.0018f;
            pm.color(0xffffff, 150);
            pm.quad(o - side, o + side, e + side, e - side); pm.quad(o - upv, o + upv, e + upv, e - upv);
            pm.color(0x30343a, 255);
            pm.roundBox(yaw * Mat4::fromQuat(in.hand[h].rot, in.hand[h].pos), Vec3(-0.018f, -0.018f, -0.01f), Vec3(0.018f, 0.018f, 0.09f), 0.012f, 1);
        }
        if (rayLen[h] < 1.19f) {
            float r = gaze ? 0.006f + 0.01f * sat(gazeT / 1.4f) : 0.006f;
            pm.color(hover >= 0 ? 0xffc84a : 0xffffff, 255);
            Vec3 c = e + Vec3(0, 0, 0.004f);
            pm.quad(c + Vec3(-r, -r, 0), c + Vec3(r, -r, 0), c + Vec3(r, r, 0), c + Vec3(-r, r, 0));
        }
    }
    if (pm.i.empty()) pointerMesh.destroy(); else pointerMesh.upload(pm, true);
}

void App::buildMenu() {
    const Route& R = world.d.route;
    MeshData bg, tx; bg.mat = MAT_UI; bg.layer = -1; tx.mat = MAT_CABIN;
    buttons.clear();
    auto P = [&](float x, float y, float z = 0) { return kPanelC + Vec3(x * kPanelS, y * kPanelS, z); };
    auto rect = [&](float x0, float y0, float x1, float y1, int col, int a, float z = 0) { bg.color(col, a); bg.quad(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)); };
    auto text = [&](const std::string& s2, float x, float y, float size, int col, int align = 1) { tx.color(col); font.draw(tx, s2.c_str(), P(x, y, 0.004f), Vec3(1, 0, 0), Vec3(0, 1, 0), size * kPanelS, align); };
    auto button = [&](int id, float x0, float y0, float x1, float y1, const std::string& label, float size, int base = 0x2b3b55) {
        bool hv = hover == id;
        rect(x0, y0, x1, y1, hv ? 0xf2b84b : base, 255, 0.002f);
        text(label, (x0 + x1) / 2, (y0 + y1) / 2 - size * 0.36f, size, hv ? 0x16130a : 0xffffff);
        buttons.push_back(Button{x0, y0, x1, y1, id});
    };
    auto row = [&](float y, const char* label, const std::string& value, int idL, int idR) {
        text(label, -0.45f, y - 0.012f, 0.034f, 0x9fb0c8, 0);
        button(idL, -0.17f, y - 0.03f, -0.10f, y + 0.035f, "◀", 0.034f);
        text(value, 0.14f, y - 0.012f, 0.034f, 0xffffff);
        button(idR, 0.38f, y - 0.03f, 0.45f, y + 0.035f, "▶", 0.034f);
    };
    rect(-0.5f, -0.36f, 0.5f, 0.36f, 0x0e1622, 238);
    rect(-0.5f, 0.345f, 0.5f, 0.36f, 0xf2b84b, 255, 0.001f);
    button(B_RECENTER, 0.30f, 0.285f, 0.47f, 0.33f, "자리 맞추기", 0.022f, 0x25344c);
    char buf[160];
    if (phase == PH_MENU) {
        text("서울 → 부산 고속버스", 0, 0.255f, 0.066f, 0xffffff);
        text("서울고속버스터미널(경부) → 부산종합버스터미널", 0, 0.195f, 0.030f, 0xc9d4e6);
        text("경부고속도로 418.9km · 소요 4시간 15분 (휴게소 15분 포함)", 0, 0.150f, 0.027f, 0x9fb0c8);
        std::string dep = kDepartOptions[departSel] < 0 ? "지금 (" + hhmm(nowClock) + ")" : hhmm(kDepartOptions[departSel]) + " 출발";
        row(0.07f, "출발 시각", dep, B_DEP_L, B_DEP_R);
        row(-0.02f, "좌석", kSeatNames[seat % 5], B_SEAT_L, B_SEAT_R);
        row(-0.11f, "진행 속도", kSpeedNames[speedSel], B_SPD_L, B_SPD_R);
        if (hasSave) {
            button(B_START, -0.45f, -0.275f, -0.03f, -0.185f, "새로 출발", 0.042f, 0x2f6f4a);
            snprintf(buf, sizeof(buf), "이어서 타기 · %dkm 지점", (int)(saved.s / 1000));
            button(B_RESUME, 0.03f, -0.275f, 0.45f, -0.185f, buf, 0.034f, 0x35507a);
        } else button(B_START, -0.22f, -0.275f, 0.22f, -0.185f, "출발", 0.046f, 0x2f6f4a);
        text("편하게 앉은 뒤 출발을 누르세요 · 트리거: 선택 · 스틱 좌우: 방향 전환 · B/Y: 메뉴 · A/X: 안내판", 0, -0.335f, 0.020f, 0x7f8da3);
    } else if (phase == PH_RIDE) {
        text("운행 중", 0, 0.255f, 0.056f, 0xffffff);
        snprintf(buf, sizeof(buf), "%s · 시속 %dkm", R.regionAt(s), (int)lroundf(speed * 3.6f));
        text(buf, 0, 0.195f, 0.032f, 0xc9d4e6);
        double rem = remainingSeconds();
        snprintf(buf, sizeof(buf), "부산까지 %dkm · 남은 시간 %d시간 %02d분 · 도착 예정 %s", (int)((R.length() - s) / 1000), (int)(rem / 3600), (int)(rem / 60) % 60, hhmm(clockNow() + rem / 3600.0).c_str());
        text(buf, 0, 0.150f, 0.027f, 0x9fb0c8);
        row(0.07f, "좌석", kSeatNames[seat % 5], B_SEAT_L, B_SEAT_R);
        row(-0.02f, "진행 속도", kSpeedNames[speedSel], B_SPD_L, B_SPD_R);
        text("안내판", -0.45f, -0.122f, 0.034f, 0x9fb0c8, 0);
        button(B_HUD, -0.17f, -0.14f, 0.45f, -0.075f, hud ? "켜짐 (눌러서 끄기)" : "꺼짐 (눌러서 켜기)", 0.032f);
        button(B_CLOSE, -0.45f, -0.275f, -0.03f, -0.185f, "계속 타기", 0.042f, 0x2f6f4a);
        button(B_END, 0.03f, -0.275f, 0.45f, -0.185f, "여행 끝내기 (저장)", 0.034f, 0x6a3a3a);
        text("배터리가 부족하면 끝내도 됩니다. 위치가 저장되어 이어서 탈 수 있습니다.", 0, -0.335f, 0.022f, 0x7f8da3);
    } else {
        text("부산 도착", 0, 0.22f, 0.07f, 0xffffff);
        text("부산종합버스터미널 (노포동)", 0, 0.14f, 0.036f, 0xc9d4e6);
        snprintf(buf, sizeof(buf), "운행 거리 418.9km · 운행 시간 %d시간 %02d분", (int)(tripTime / 3600), (int)(tripTime / 60) % 60);
        text(buf, 0, 0.06f, 0.032f, 0x9fb0c8);
        snprintf(buf, sizeof(buf), "도착 시각 %s", hhmm(clockNow()).c_str());
        text(buf, 0, 0.0f, 0.032f, 0x9fb0c8);
        text("이용해 주셔서 감사합니다.", 0, -0.09f, 0.034f, 0xffffff);
        button(B_RESTART, -0.22f, -0.275f, 0.22f, -0.185f, "처음으로", 0.044f, 0x2f6f4a);
    }
    uiBg.upload(bg, true); uiText.upload(tx, true);
}

void App::buildDisplays() {
    const Route& R = world.d.route;
    MeshData bg, tx; bg.mat = MAT_UI; bg.layer = -1; tx.mat = MAT_EMIT;
    char buf[200];
    const Place* np = nextPlace();
    bool riding = phase == PH_RIDE;
    std::string clk = hhmm(phase == PH_MENU ? env.clockHours : clockNow());
    bool showBanner = timeSec < bannerUntil && !banner.empty();
    bool resting = riding && dwellLeft > 0 && nextStop > 0 && R.stops[nextStop - 1].type == 1;
    // ---- LED strip above the windscreen
    {
        Vec3 c = bus.ledCenter() + Vec3(0, 0, 0.004f);
        bg.color(0x07080a, 255); bg.quad(c + Vec3(-0.70f, -0.10f, 0), c + Vec3(0.70f, -0.10f, 0), c + Vec3(0.70f, 0.10f, 0), c + Vec3(-0.70f, 0.10f, 0));
        tx.color(0xffa722);
        font.draw(tx, "부산", c + Vec3(-0.66f, -0.045f, 0.003f), Vec3(1, 0, 0), Vec3(0, 1, 0), 0.115f, 0);
        font.draw(tx, clk.c_str(), c + Vec3(0.66f, -0.04f, 0.003f), Vec3(1, 0, 0), Vec3(0, 1, 0), 0.10f, 2);
        std::string mid;
        if (resting) { snprintf(buf, sizeof(buf), "출발까지 %d:%02d", (int)(dwellLeft / 60), (int)dwellLeft % 60); mid = buf; }
        else if (riding && np) { snprintf(buf, sizeof(buf), "%s %.0fkm", np->name.c_str(), std::max((np->s - (float)s) / 1000.f, 0.f)); mid = buf; }
        else if (phase == PH_ARRIVED) mid = "종점";
        else mid = "우등고속";
        float sz = std::min(0.075f, 0.78f / std::max(font.width(mid.c_str(), 1.f), 0.1f));
        tx.color(0x58e06a);
        font.draw(tx, mid.c_str(), c + Vec3(0.02f, -0.028f, 0.003f), Vec3(1, 0, 0), Vec3(0, 1, 0), sz, 1);
    }
    // ---- information monitor
    {
        Vec3 c = bus.monitorCenter() + Vec3(0, 0, 0.004f);
        bg.color(0x0b1830, 255); bg.quad(c + Vec3(-0.31f, -0.18f, 0), c + Vec3(0.31f, -0.18f, 0), c + Vec3(0.31f, 0.18f, 0), c + Vec3(-0.31f, 0.18f, 0));
        bg.color(0xf2b84b, 255); bg.quad(c + Vec3(-0.31f, 0.105f, 0.001f), c + Vec3(0.31f, 0.105f, 0.001f), c + Vec3(0.31f, 0.11f, 0.001f), c + Vec3(-0.31f, 0.11f, 0.001f));
        auto line = [&](const std::string& s2, float y, float size, int col, int align = 0, float x = -0.285f) {
            float sz = std::min(size, 0.57f / std::max(font.width(s2.c_str(), 1.f), 0.1f));
            tx.color(col); font.draw(tx, s2.c_str(), c + Vec3(x, y, 0.003f), Vec3(1, 0, 0), Vec3(0, 1, 0), sz, align);
        };
        line("서울 → 부산", 0.125f, 0.042f, 0xffffff);
        line(clk, 0.125f, 0.042f, 0xffd27a, 2, 0.285f);
        if (showBanner) {
            size_t cut = banner.find(". ");
            if (cut != std::string::npos && cut + 2 < banner.size()) { line(banner.substr(0, cut + 1), 0.045f, 0.036f, 0xffe27a); line(banner.substr(cut + 2), -0.01f, 0.036f, 0xffe27a); }
            else line(banner, 0.02f, 0.036f, 0xffe27a);
        } else if (phase == PH_MENU) {
            line("서울고속버스터미널", 0.045f, 0.040f, 0xffffff); line("부산행 · 곧 출발합니다", -0.01f, 0.034f, 0xb9c8e0);
        } else {
            line(R.regionAt(s), 0.045f, 0.040f, 0xffffff);
            if (resting) { snprintf(buf, sizeof(buf), "휴게소 정차 · 출발까지 %d:%02d", (int)(dwellLeft / 60), (int)dwellLeft % 60); line(buf, -0.01f, 0.034f, 0xffe27a); }
            else if (np) { snprintf(buf, sizeof(buf), "다음  %s  %.1fkm", np->name.c_str(), std::max((np->s - (float)s) / 1000.f, 0.f)); line(buf, -0.01f, 0.034f, 0xb9c8e0); }
        }
        double rem = remainingSeconds();
        snprintf(buf, sizeof(buf), "부산까지 %dkm · 도착 예정 %s", (int)((R.length() - s) / 1000), hhmm((phase == PH_MENU ? env.clockHours : clockNow()) + rem / 3600.0).c_str());
        line(buf, -0.075f, 0.032f, 0x8fd0ff);
        snprintf(buf, sizeof(buf), "시속 %dkm", (int)lroundf(speed * 3.6f));
        line(buf, -0.145f, 0.040f, 0xffffff);
        // progress bar along the bottom
        float pr = sat((float)(s / R.length()));
        bg.color(0x24344f, 255); bg.quad(c + Vec3(0.02f, -0.142f, 0.001f), c + Vec3(0.285f, -0.142f, 0.001f), c + Vec3(0.285f, -0.128f, 0.001f), c + Vec3(0.02f, -0.128f, 0.001f));
        bg.color(0x58e06a, 255); bg.quad(c + Vec3(0.02f, -0.142f, 0.002f), c + Vec3(0.02f + 0.265f * pr, -0.142f, 0.002f), c + Vec3(0.02f + 0.265f * pr, -0.128f, 0.002f), c + Vec3(0.02f, -0.128f, 0.002f));
    }
    dispBg.upload(bg, true); dispText.upload(tx, true);

    // ---- personal info card (toggled with A / X), resting above the knees
    MeshData hb, ht; hb.mat = MAT_UI; hb.layer = -1; ht.mat = MAT_CABIN;
    if (hud) {
        Mat4 M = Mat4::translate(Vec3(0.0f, -0.30f, -0.46f)) * Mat4::rotX(radf(-52));
        auto Q = [&](float x, float y, float z = 0) { return M.point(Vec3(x, y, z)); };
        Vec3 rt = M.dir(Vec3(1, 0, 0)), up = M.dir(Vec3(0, 1, 0));
        hb.color(0x0e1622, 225); hb.quad(Q(-0.19f, -0.075f), Q(0.19f, -0.075f), Q(0.19f, 0.075f), Q(-0.19f, 0.075f));
        hb.color(0xf2b84b, 255); hb.quad(Q(-0.19f, 0.071f, 0.001f), Q(0.19f, 0.071f, 0.001f), Q(0.19f, 0.075f, 0.001f), Q(-0.19f, 0.075f, 0.001f));
        auto line = [&](const std::string& s2, float y, float size, int col) {
            float sz = std::min(size, 0.35f / std::max(font.width(s2.c_str(), 1.f), 0.1f));
            ht.color(col); font.draw(ht, s2.c_str(), Q(-0.175f, y, 0.002f), rt, up, sz, 0);
        };
        snprintf(buf, sizeof(buf), "%s  ·  %s  ·  시속 %dkm", clk.c_str(), R.regionAt(s), (int)lroundf(speed * 3.6f)); line(buf, 0.036f, 0.021f, 0xffffff);
        if (resting) { snprintf(buf, sizeof(buf), "추풍령휴게소 정차 · 출발까지 %d:%02d", (int)(dwellLeft / 60), (int)dwellLeft % 60); line(buf, 0.0f, 0.021f, 0xffe27a); }
        else if (np) { snprintf(buf, sizeof(buf), "다음 %s %.1fkm", np->name.c_str(), std::max((np->s - (float)s) / 1000.f, 0.f)); line(buf, 0.0f, 0.021f, 0xb9c8e0); }
        double rem = remainingSeconds();
        snprintf(buf, sizeof(buf), "부산까지 %dkm · %d시간 %02d분 남음 · 도착 %s", (int)((R.length() - s) / 1000), (int)(rem / 3600), (int)(rem / 60) % 60, hhmm(clockNow() + rem / 3600.0).c_str());
        line(buf, -0.036f, 0.021f, 0x8fd0ff);
    }
    if (hb.i.empty()) { hudBg.destroy(); hudText.destroy(); } else { hudBg.upload(hb, true); hudText.upload(ht, true); }
}
