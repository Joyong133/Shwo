// The trip itself: bus motion along the route, time of day, input, menus, traffic and frame rendering.
#pragma once
#include "render.h"
#include "bus.h"
#include "models.h"
#include "audio.h"

struct EyeView { Vec3 pos; Quat rot; float tanL = -1, tanR = 1, tanU = 1, tanD = -1; };       // pose in XR local space (origin = resting head)
struct HandState { bool valid = false; Vec3 pos; Quat rot; float trigger = 0; float stickX = 0, stickY = 0; bool btnA = false, btnB = false; };
struct AppInput { EyeView eye[2]; HandState hand[2]; bool menu = false; double dt = 1.0 / 72; };

enum Phase { PH_MENU = 0, PH_RIDE = 1, PH_ARRIVED = 2 };

struct Vehicle { double s; float lat, v, want; int type, tint, dir, lane; };
struct Button { float x0, y0, x1, y1; int id; };
struct SaveData { uint32_t magic = 0; double s = 0, tripTime = 0, departClock = 0; float dwellLeft = 0, timeScale = 1; int nextStop = 0, seat = 0, month = 0, dayOfYear = 0; };

struct App {
    Renderer ren; World world; Font font; Env env; BusModel bus; Audio audio;
    Mesh passengers;
    // ---- trip state
    int phase = PH_MENU; double s = 0, tripTime = 0; float dwellLeft = 0; int nextStop = 0; float speed = 0, accel = 0;
    double departClock = 14.0, nowClock = 14.0; float timeScale = 1.f; int month = 11, dayOfYear = 315;
    int seat = 0; float seatYaw = 0; bool showBus = true;
    // seat calibration: wherever the rider's head is when they sit down becomes the seat's head position
    Mat4 recenterInv = Mat4::identity(); bool recentered = false, autoRecenter = true; AppInput lastIn; double trackedFor = 0;
    void recenter(const AppInput& in);
    Mat4 seatFromLocal() const { return Mat4::rotY(seatYaw) * recenterInv; }
    // ---- settings / menu
    int departSel = 0, speedSel = 0; bool menuOpen = true, hud = false;
    bool hasSave = false; SaveData saved; double saveTimer = 0; bool dirty = false;
    std::vector<Button> buttons; int hover = -1; float gazeT = 0;
    bool prevTrig[2] = {false, false}, prevA = false, prevB = false, prevMenu = false; int prevStick = 0;
    Vec3 rayO[2], rayD[2]; bool rayOn[2] = {false, false}; float rayLen[2] = {1.5f, 1.5f};
    // ---- announcements
    std::string banner; double bannerUntil = 0; bool annDepart = false, annRest = false, annArrive = false, annRestLeave = false; int lastBridge = 0;
    // ---- bus pose (world)
    Vec3d busPos; Vec3 busFwd, busRight, busUp; Mat4 busMat; float roll = 0, pitch = 0;
    double timeSec = 0, dispTimer = 1e9;
    // ---- dynamic meshes
    Mesh uiBg, uiText, dispBg, dispText, hudBg, hudText, pointerMesh, sigMesh, vehGlow, shadowMesh;
    double lastSave = -100;
    // ---- traffic
    Mesh vehMesh[VEH_COUNT]; VehicleInfo vehInfo[VEH_COUNT]; std::vector<Vehicle> cars; uint32_t rngState = 99;

    bool init();
    void shutdown();
    void onPause();
    // simulation
    void startTrip(bool resume);
    void advance(double dt);
    void computeBusPose(double dt);
    void update(const AppInput& in, bool blockingLoad);
    void render(StereoTarget& rt, GLuint colorTex, const AppInput& in);
    Vec3 seatEye() const;
    void setSeat(int sel);
    // info
    double clockNow() const { return fmod(departClock + tripTime / 3600.0 + 48.0, 24.0); }
    double remainingSeconds() const;
    const Place* nextPlace() const;
    // ui (app_ui.cpp)
    void handleInput(const AppInput& in);
    void buildMenu();
    void buildDisplays();
    void click(int id);
    void loadSave(); void writeSave(); void clearSave();
    void announce(const std::string& text, double seconds, bool chime);
    // traffic (app_traffic.cpp)
    void initTraffic();
    void updateTraffic(double dt);
    void drawTraffic(const Vec3& headFwd);
    void buildSignals();
    float frand() { rngState ^= rngState << 13; rngState ^= rngState >> 17; rngState ^= rngState << 5; return (rngState & 0xFFFFFF) / 16777216.f; }
};
