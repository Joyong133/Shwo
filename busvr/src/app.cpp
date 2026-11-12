#include "app.h"

static const float kDepartOptions[] = {-1.f, 6.5f, 8.f, 11.f, 14.f, 16.5f, 19.f, 22.f};
static const float kSpeedOptions[] = {1.f, 4.f, 16.f, 60.f};

bool App::init() {
    Gfx::get().init();
    if (!font.load("font.bin")) return false;
    if (!ren.init()) return false;
    if (!world.init(&font)) return false;
    bus.build();
    setSeat(seat);
    initTraffic();
    audio.start();
    loadSave();
    s = 0; computeBusPose(0);
    return true;
}
void App::shutdown() { audio.stop(); world.shutdown(); }
void App::onPause() { if (dirty && phase == PH_RIDE) writeSave(); }

Vec3 App::seatEye() const { return bus.eye(bus.choices[seat % (int)bus.choices.size()]); }
void App::setSeat(int sel) {
    int n = (int)bus.choices.size(); seat = ((sel % n) + n) % n;
    MeshData p; bus.buildPassengers(p, bus.choices[seat], 1234);
    if (p.i.empty()) passengers.destroy(); else passengers.upload(p);
}

void App::startTrip(bool resume) {
    const Route& R = world.d.route;
    if (resume && hasSave) {
        s = saved.s; tripTime = saved.tripTime; departClock = saved.departClock; dwellLeft = saved.dwellLeft; nextStop = saved.nextStop;
        timeScale = saved.timeScale; setSeat(saved.seat);
        for (int i = 0; i < 4; i++) if (fabsf(kSpeedOptions[i] - timeScale) < 0.01f) speedSel = i;
        annDepart = true; annRest = s > R.S_REST - 2000.f; annArrive = false;
    } else {
        s = 0; tripTime = 0; dwellLeft = 0; nextStop = 0;
        departClock = kDepartOptions[departSel] < 0 ? nowClock : kDepartOptions[departSel];
        timeScale = kSpeedOptions[speedSel];
        annDepart = annRest = annArrive = false;
    }
    phase = PH_RIDE; menuOpen = false; speed = 0; cars.clear();
    audio.trigger(AE_DOOR);
}

double App::remainingSeconds() const {
    const Route& R = world.d.route;
    double t = R.t.back() - R.attr(R.t, s) + dwellLeft;
    for (int i = nextStop; i < (int)R.stops.size(); i++) t += R.stops[i].dwell;
    return t;
}
const Place* App::nextPlace() const {
    for (const Place& p : world.d.route.places) if (p.s > s + 30.f) return &p;
    return nullptr;
}
void App::announce(const std::string& text, double seconds, bool chime) {
    banner = text; bannerUntil = timeSec + seconds; dispTimer = 1e9;
    if (chime) audio.trigger(AE_CHIME);
}

void App::advance(double dt) {
    const Route& R = world.d.route;
    double left = dt * timeScale; float v0 = speed;
    while (left > 1e-6 && phase == PH_RIDE) {
        double h = std::min(left, 0.2); left -= h; tripTime += h; dirty = true;
        if (dwellLeft > 0) {
            dwellLeft -= (float)h; speed = 0;
            if (dwellLeft <= 0 && nextStop > 0 && R.stops[nextStop - 1].type == 1) { announce("출발합니다. 안전벨트를 매 주세요.", 12, true); audio.trigger(AE_DOOR); }
            continue;
        }
        float v = std::max(R.attr(R.v, s), 0.35f);
        s += v * h; speed = v;
        if (nextStop < (int)R.stops.size() && s >= R.stops[nextStop].s) {
            s = R.stops[nextStop].s; dwellLeft = R.stops[nextStop].dwell; speed = 0;
            if (R.stops[nextStop].type == 1) { announce("추풍령휴게소입니다. 15분간 정차합니다.", 20, true); audio.trigger(AE_DOOR); }
            nextStop++;
        }
        if (s >= R.length() - 1.0) {
            s = R.length() - 1.0; phase = PH_ARRIVED; speed = 0; menuOpen = true; clearSave();
            announce("종점 부산종합버스터미널입니다. 이용해 주셔서 감사합니다.", 60, true); audio.trigger(AE_DOOR);
        }
    }
    if (dt > 1e-6) { float a = (speed - v0) / (float)(dt * timeScale); accel += (a - accel) * std::min(1.f, (float)dt * 3.f); }
    if (phase != PH_RIDE) return;
    if (!annDepart && tripTime > 4) { annDepart = true; announce("이 버스는 부산행 고속버스입니다. 전 좌석 안전벨트를 매 주세요.", 16, true); }
    if (!annRest && s > R.S_REST - 2200.f && s < R.S_REST) { annRest = true; announce("잠시 후 추풍령휴게소에 도착합니다. 15분간 정차합니다.", 18, true); }
    if (!annArrive && s > R.length() - 6000.f) { annArrive = true; announce("잠시 후 종점 부산종합버스터미널에 도착합니다.", 18, true); }
    int br = (R.flags[R.idx(s)] & RF_BRIDGE) ? 1 : 0;
    if (br != lastBridge) { lastBridge = br; if (speed > 12 && timeScale < 8) audio.trigger(AE_BUMP); }
}

void App::computeBusPose(double dt) {
    const Route& R = world.d.route;
    auto at = [&](double ss) { Vec3d c; Vec3 f, r; R.frame(ss, c, f, r); float o = R.attr(R.off, ss); return Vec3d(c.x + r.x * o, c.y, c.z + r.z * o); };
    double sc = std::min(std::max(s, 6.5), (double)R.length() - 6.5);
    busPos = at(sc);
    Vec3d a = at(sc - 4.0), b = at(sc + 4.0);
    Vec3 fwd = normalize(Vec3((float)(b.x - a.x), (float)(b.y - a.y), (float)(b.z - a.z)));
    // body roll in bends and pitch under braking, kept small for comfort
    float lat = speed * speed * R.attr(R.curv, sc);
    float k = dt > 0 ? std::min(1.f, (float)dt * 2.5f) : 1.f;
    roll += (clampf(lat * 0.006f, -0.018f, 0.018f) - roll) * k;
    pitch += (clampf(-accel * 0.006f, -0.012f, 0.012f) - pitch) * k;
    Vec3 right = normalize(cross(fwd, Vec3(0, 1, 0))), up = cross(right, fwd);
    Mat4 base = Mat4::basis(right, up, -fwd, Vec3(0, 0, 0));
    busMat = base * Mat4::rotZ(roll) * Mat4::rotX(pitch);
    busFwd = busMat.dir(Vec3(0, 0, -1)); busRight = busMat.dir(Vec3(1, 0, 0)); busUp = busMat.dir(Vec3(0, 1, 0));
}

void App::update(const AppInput& in, bool blockingLoad) {
    timeSec += in.dt;
    handleInput(in);
    if (phase == PH_RIDE) advance(in.dt);
    computeBusPose(in.dt);
    const Route& R = world.d.route;
    env.month = month; env.dayOfYear = dayOfYear;
    if (phase == PH_MENU) env.clockHours = kDepartOptions[departSel] < 0 ? nowClock : kDepartOptions[departSel];
    else env.clockHours = clockNow();
    R.lonLat(s, env.lon, env.lat);
    float tun = R.attr(R.wTunnel, s);
    env.tunnel += (tun - env.tunnel) * (float)std::min(1.0, in.dt * timeScale * 2.0 + (blockingLoad ? 1.0 : 0.0));
    env.update();
    world.update(s, busPos, blockingLoad);
    updateTraffic(in.dt * (phase == PH_RIDE ? timeScale : 1.f));
    buildSignals();
    audio.synth.speed = speed; audio.synth.accel = accel; audio.synth.tunnel = env.tunnel;
    audio.synth.active = phase == PH_RIDE ? 1.f : 0.45f; audio.synth.volume = timeScale > 8 ? 0.35f : 1.f;
    dispTimer += in.dt;
    if (dispTimer > 0.5) { dispTimer = 0; buildDisplays(); }
    if (menuOpen) buildMenu();
    saveTimer += in.dt;
    if (phase == PH_RIDE && saveTimer > 15) { saveTimer = 0; writeSave(); }
}

void App::render(StereoTarget& rt, GLuint colorTex, const AppInput& in) {
    FrameUBO f; memset(&f, 0, sizeof(f));
    Mat4 seatBase = Mat4::translate(seatEye());
    Mat4 seatM = seatBase * Mat4::rotY(seatYaw);
    Vec3 headFwd(0, 0, -1);
    for (int e = 0; e < 2; e++) {
        Mat4 eyeLocal = Mat4::fromQuat(in.eye[e].rot, in.eye[e].pos);
        Mat4 eyeWorld = busMat * seatM * eyeLocal;
        Mat4 view = eyeWorld.rigidInverse();
        Mat4 proj = Mat4::frustumTan(in.eye[e].tanL, in.eye[e].tanR, in.eye[e].tanD, in.eye[e].tanU, 0.07f, 42000.f);
        Mat4 vp = proj * view; memcpy(f.viewProj[e], vp.m, 64);
        Mat4 ivp = vp.inverse(); memcpy(f.invViewProj[e], ivp.m, 64);
        f.eyePos[e][0] = eyeWorld.m[12]; f.eyePos[e][1] = eyeWorld.m[13]; f.eyePos[e][2] = eyeWorld.m[14]; f.eyePos[e][3] = 1;
        if (e == 0) headFwd = normalize(eyeWorld.dir(Vec3(0, 0, -1)));
    }
    env.fill(f);
    f.busPos[0] = f.busPos[1] = f.busPos[2] = 0;
    f.busFwd[0] = busFwd.x; f.busFwd[1] = busFwd.y; f.busFwd[2] = busFwd.z; f.busFwd[3] = std::max(env.night, env.tunnel * 0.6f);
    f.time[0] = (float)fmod(timeSec, 3600.0);
    for (int pass = 0; pass < rt.passes(); pass++) {
        f.misc[3] = (float)pass;
        Gfx::get().updateFrame(f);
        rt.bind(colorTex, pass);
        glClearColor(0, 0, 0, 1); glDepthMask(GL_TRUE);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        glEnable(GL_DEPTH_TEST); glDepthFunc(GL_LEQUAL); glEnable(GL_CULL_FACE); glDisable(GL_BLEND);
        ren.lit.use(); ren.lit.set4("uTint", 1, 1, 1, 1);
        if (showBus) {
            ren.drawLit(bus.opaque, busMat, ren.texInterior, 2.f);
            ren.drawLit(passengers, busMat, ren.texInterior, 2.f);
            ren.drawLit(dispBg, busMat, ren.texInterior, 2.f);
        }
        ren.drawWorldOpaque(world, env, busPos, headFwd);
        drawTraffic(headFwd);
        ren.drawLit(sigMesh, Mat4::identity(), ren.texFacade, 1.f);
        ren.drawSky();
        ren.drawWorldAlpha(world, env, busPos, headFwd, font);
        // blended: lamp glows of the traffic, then everything attached to the bus
        glEnable(GL_BLEND); glDepthMask(GL_FALSE); glDisable(GL_CULL_FACE);
        if (env.night > 0.02f && vehGlow.valid()) {
            glBlendFunc(GL_ONE, GL_ONE);
            ren.bill.use(); ren.bill.set4("uParams", 1, 0, 0, 0); ren.bill.setMat4("uModel", Mat4::identity()); vehGlow.draw();
        }
        glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
        glEnable(GL_CULL_FACE);
        if (showBus) {
            ren.drawText(dispText, busMat, font);
            ren.drawLit(bus.glass, busMat, ren.texInterior, 2.f);
        }
        Mat4 seatWorld = busMat * seatBase;
        glDisable(GL_CULL_FACE);
        if (hud && !menuOpen) { ren.drawLit(hudBg, seatWorld, ren.texInterior, 2.f); ren.drawText(hudText, seatWorld, font); }
        if (menuOpen) {
            ren.drawLit(uiBg, seatWorld, ren.texInterior, 2.f); ren.drawText(uiText, seatWorld, font);
            ren.drawLit(pointerMesh, seatWorld, ren.texInterior, 2.f);
        }
        glEnable(GL_CULL_FACE);
        glDisable(GL_BLEND); glDepthMask(GL_TRUE);
        rt.resolve(colorTex, pass);
    }
}
