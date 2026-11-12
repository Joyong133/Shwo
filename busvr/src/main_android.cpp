// Meta Quest entry point: NativeActivity + EGL + OpenXR (stereo multiview swapchain, Touch controllers).
#include "app.h"
#include <android_native_app_glue.h>
#include <android/asset_manager.h>
#include <EGL/egl.h>
#include <jni.h>
#include <unistd.h>
#include <ctime>
#define XR_USE_PLATFORM_ANDROID
#define XR_USE_GRAPHICS_API_OPENGL_ES
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>

static android_app* gApp = nullptr;

bool platformReadAsset(const char* name, std::vector<uint8_t>& out) {
    AAsset* a = AAssetManager_open(gApp->activity->assetManager, name, AASSET_MODE_BUFFER);
    if (!a) return false;
    off_t n = AAsset_getLength(a); out.resize((size_t)n);
    int64_t got = 0;
    while (got < n) { int r = AAsset_read(a, out.data() + got, (size_t)(n - got)); if (r <= 0) break; got += r; }
    AAsset_close(a);
    return got == n;
}
void* platformGLProc(const char* name) { return (void*)eglGetProcAddress(name); }
std::string platformSavePath() { return std::string(gApp->activity->internalDataPath ? gApp->activity->internalDataPath : "/data/local/tmp") + "/trip.sav"; }

#define XRCHK(call) do { XrResult _r = (call); if (XR_FAILED(_r)) { LOGE("%s failed: %d", #call, (int)_r); return false; } } while (0)
#define XRWARN(call) do { XrResult _r = (call); if (XR_FAILED(_r)) LOGE("%s failed: %d (continuing)", #call, (int)_r); } while (0)

struct Xr {
    // lifecycle
    bool resumed = false, sessionRunning = false, focused = false, exitRequested = false;
    // EGL
    EGLDisplay dpy = EGL_NO_DISPLAY; EGLConfig cfg = nullptr; EGLContext ctx = EGL_NO_CONTEXT; EGLSurface surf = EGL_NO_SURFACE;
    // OpenXR
    XrInstance instance = XR_NULL_HANDLE; XrSystemId systemId = XR_NULL_SYSTEM_ID; XrSession session = XR_NULL_HANDLE;
    XrSpace localSpace = XR_NULL_HANDLE; XrSessionState state = XR_SESSION_STATE_UNKNOWN;
    XrSwapchain swapchain = XR_NULL_HANDLE; std::vector<XrSwapchainImageOpenGLESKHR> images; int w = 0, h = 0;
    bool extFoveation = false, extPerf = false;
    // input
    XrActionSet actionSet = XR_NULL_HANDLE; XrAction aTrigger = XR_NULL_HANDLE, aStick = XR_NULL_HANDLE, aA = XR_NULL_HANDLE, aB = XR_NULL_HANDLE, aMenu = XR_NULL_HANDLE, aAim = XR_NULL_HANDLE;
    XrPath handPath[2] = {XR_NULL_PATH, XR_NULL_PATH}; XrSpace aimSpace[2] = {XR_NULL_HANDLE, XR_NULL_HANDLE};
    StereoTarget rt;
};
static Xr X;

static void onAppCmd(android_app* app, int32_t cmd) {
    switch (cmd) {
        case APP_CMD_RESUME: X.resumed = true; LOGI("APP_CMD_RESUME"); break;
        case APP_CMD_PAUSE: X.resumed = false; LOGI("APP_CMD_PAUSE"); break;
        case APP_CMD_DESTROY: LOGI("APP_CMD_DESTROY"); break;
        default: break;
    }
    (void)app;
}

static bool initEGL() {
    X.dpy = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    EGLint ma = 0, mi = 0;
    if (!eglInitialize(X.dpy, &ma, &mi)) { LOGE("eglInitialize failed"); return false; }
    // Pick an RGBA8888 ES3 config by hand (eglChooseConfig may hand back multisampled or depth-carrying configs first).
    EGLint num = 0; eglGetConfigs(X.dpy, nullptr, 0, &num);
    std::vector<EGLConfig> cfgs((size_t)num); eglGetConfigs(X.dpy, cfgs.data(), num, &num);
    X.cfg = nullptr;
    for (EGLConfig c : cfgs) {
        EGLint v = 0;
        eglGetConfigAttrib(X.dpy, c, EGL_RENDERABLE_TYPE, &v); if (!(v & EGL_OPENGL_ES3_BIT)) continue;
        eglGetConfigAttrib(X.dpy, c, EGL_SURFACE_TYPE, &v); if ((v & (EGL_WINDOW_BIT | EGL_PBUFFER_BIT)) != (EGL_WINDOW_BIT | EGL_PBUFFER_BIT)) continue;
        EGLint r, g, b, a, d, s, sm;
        eglGetConfigAttrib(X.dpy, c, EGL_RED_SIZE, &r); eglGetConfigAttrib(X.dpy, c, EGL_GREEN_SIZE, &g); eglGetConfigAttrib(X.dpy, c, EGL_BLUE_SIZE, &b);
        eglGetConfigAttrib(X.dpy, c, EGL_ALPHA_SIZE, &a); eglGetConfigAttrib(X.dpy, c, EGL_DEPTH_SIZE, &d); eglGetConfigAttrib(X.dpy, c, EGL_STENCIL_SIZE, &s);
        eglGetConfigAttrib(X.dpy, c, EGL_SAMPLES, &sm);
        if (r == 8 && g == 8 && b == 8 && a == 8 && d == 0 && s == 0 && sm == 0) { X.cfg = c; break; }
    }
    if (!X.cfg) {
        const EGLint attrs[] = {EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT, EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8, EGL_NONE};
        EGLint n = 0; if (!eglChooseConfig(X.dpy, attrs, &X.cfg, 1, &n) || n < 1) { LOGE("no EGL config"); return false; }
    }
    const EGLint ctxAttrs[] = {EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE};
    X.ctx = eglCreateContext(X.dpy, X.cfg, EGL_NO_CONTEXT, ctxAttrs);
    if (X.ctx == EGL_NO_CONTEXT) { LOGE("eglCreateContext failed 0x%x", eglGetError()); return false; }
    const EGLint pb[] = {EGL_WIDTH, 16, EGL_HEIGHT, 16, EGL_NONE};
    X.surf = eglCreatePbufferSurface(X.dpy, X.cfg, pb);
    if (X.surf == EGL_NO_SURFACE) { LOGE("eglCreatePbufferSurface failed 0x%x", eglGetError()); return false; }
    if (!eglMakeCurrent(X.dpy, X.surf, X.surf, X.ctx)) { LOGE("eglMakeCurrent failed 0x%x", eglGetError()); return false; }
    return true;
}

static bool hasExt(const std::vector<XrExtensionProperties>& v, const char* n) { for (auto& e : v) if (!strcmp(e.extensionName, n)) return true; return false; }

static bool initXrInstance(android_app* app) {
    PFN_xrInitializeLoaderKHR initLoader = nullptr;
    if (XR_SUCCEEDED(xrGetInstanceProcAddr(XR_NULL_HANDLE, "xrInitializeLoaderKHR", (PFN_xrVoidFunction*)&initLoader)) && initLoader) {
        XrLoaderInitInfoAndroidKHR li = {XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR};
        li.applicationVM = app->activity->vm; li.applicationContext = app->activity->clazz;
        XRCHK(initLoader((const XrLoaderInitInfoBaseHeaderKHR*)&li));
    }
    uint32_t n = 0; XRCHK(xrEnumerateInstanceExtensionProperties(nullptr, 0, &n, nullptr));
    std::vector<XrExtensionProperties> props(n, {XR_TYPE_EXTENSION_PROPERTIES});
    XRCHK(xrEnumerateInstanceExtensionProperties(nullptr, n, &n, props.data()));
    std::vector<const char*> exts = {XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME, XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME};
    for (const char* e : exts) if (!hasExt(props, e)) { LOGE("required OpenXR extension missing: %s", e); return false; }
    if (hasExt(props, XR_FB_FOVEATION_EXTENSION_NAME) && hasExt(props, XR_FB_FOVEATION_CONFIGURATION_EXTENSION_NAME) && hasExt(props, XR_FB_SWAPCHAIN_UPDATE_STATE_EXTENSION_NAME)) {
        X.extFoveation = true;
        exts.push_back(XR_FB_FOVEATION_EXTENSION_NAME); exts.push_back(XR_FB_FOVEATION_CONFIGURATION_EXTENSION_NAME); exts.push_back(XR_FB_SWAPCHAIN_UPDATE_STATE_EXTENSION_NAME);
    }
    if (hasExt(props, XR_EXT_PERFORMANCE_SETTINGS_EXTENSION_NAME)) { X.extPerf = true; exts.push_back(XR_EXT_PERFORMANCE_SETTINGS_EXTENSION_NAME); }

    XrInstanceCreateInfoAndroidKHR ai = {XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR};
    ai.applicationVM = app->activity->vm; ai.applicationActivity = app->activity->clazz;
    XrInstanceCreateInfo ci = {XR_TYPE_INSTANCE_CREATE_INFO};
    ci.next = &ai;
    strncpy(ci.applicationInfo.applicationName, "SeoulBusanBusVR", XR_MAX_APPLICATION_NAME_SIZE - 1);
    strncpy(ci.applicationInfo.engineName, "busvr", XR_MAX_ENGINE_NAME_SIZE - 1);
    ci.applicationInfo.applicationVersion = 1; ci.applicationInfo.engineVersion = 1;
#ifdef XR_API_VERSION_1_0
    ci.applicationInfo.apiVersion = XR_API_VERSION_1_0;
#else
    ci.applicationInfo.apiVersion = XR_MAKE_VERSION(1, 0, 34);
#endif
    ci.enabledExtensionCount = (uint32_t)exts.size(); ci.enabledExtensionNames = exts.data();
    XRCHK(xrCreateInstance(&ci, &X.instance));
    XrSystemGetInfo si = {XR_TYPE_SYSTEM_GET_INFO}; si.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
    XRCHK(xrGetSystem(X.instance, &si, &X.systemId));
    PFN_xrGetOpenGLESGraphicsRequirementsKHR getReq = nullptr;
    XRCHK(xrGetInstanceProcAddr(X.instance, "xrGetOpenGLESGraphicsRequirementsKHR", (PFN_xrVoidFunction*)&getReq));
    XrGraphicsRequirementsOpenGLESKHR req = {XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR};
    XRCHK(getReq(X.instance, X.systemId, &req));
    return true;
}

static bool initXrSession() {
    XrGraphicsBindingOpenGLESAndroidKHR gb = {XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR};
    gb.display = X.dpy; gb.config = X.cfg; gb.context = X.ctx;
    XrSessionCreateInfo sci = {XR_TYPE_SESSION_CREATE_INFO}; sci.next = &gb; sci.systemId = X.systemId;
    XRCHK(xrCreateSession(X.instance, &sci, &X.session));
    XrReferenceSpaceCreateInfo rci = {XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
    rci.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL; rci.poseInReferenceSpace.orientation.w = 1;
    XRCHK(xrCreateReferenceSpace(X.session, &rci, &X.localSpace));

    // views + swapchain (one 2-layer array texture, rendered with multiview)
    uint32_t nv = 0; XRCHK(xrEnumerateViewConfigurationViews(X.instance, X.systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0, &nv, nullptr));
    std::vector<XrViewConfigurationView> vcv(nv, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
    XRCHK(xrEnumerateViewConfigurationViews(X.instance, X.systemId, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, nv, &nv, vcv.data()));
    if (nv < 2) { LOGE("stereo view configuration not available"); return false; }
    X.w = (int)vcv[0].recommendedImageRectWidth; X.h = (int)vcv[0].recommendedImageRectHeight;
    uint32_t nf = 0; XRCHK(xrEnumerateSwapchainFormats(X.session, 0, &nf, nullptr));
    std::vector<int64_t> fmts(nf); XRCHK(xrEnumerateSwapchainFormats(X.session, nf, &nf, fmts.data()));
    int64_t fmt = 0;
    for (int64_t f : fmts) if (f == GL_SRGB8_ALPHA8) fmt = f;
    if (!fmt) for (int64_t f : fmts) if (f == GL_RGBA8) fmt = f;
    if (!fmt) { LOGE("no usable swapchain format"); return false; }
    XrSwapchainCreateInfo sc = {XR_TYPE_SWAPCHAIN_CREATE_INFO};
    XrSwapchainCreateInfoFoveationFB fov = {XR_TYPE_SWAPCHAIN_CREATE_INFO_FOVEATION_FB};
    if (X.extFoveation) sc.next = &fov;
    sc.usageFlags = XR_SWAPCHAIN_USAGE_SAMPLED_BIT | XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT;
    sc.format = fmt; sc.sampleCount = 1; sc.width = (uint32_t)X.w; sc.height = (uint32_t)X.h; sc.faceCount = 1; sc.arraySize = 2; sc.mipCount = 1;
    XrResult r = xrCreateSwapchain(X.session, &sc, &X.swapchain);
    if (XR_FAILED(r) && X.extFoveation) { LOGE("swapchain with foveation failed (%d), retrying without", (int)r); X.extFoveation = false; sc.next = nullptr; r = xrCreateSwapchain(X.session, &sc, &X.swapchain); }
    if (XR_FAILED(r)) { LOGE("xrCreateSwapchain failed: %d", (int)r); return false; }
    uint32_t ni = 0; XRCHK(xrEnumerateSwapchainImages(X.swapchain, 0, &ni, nullptr));
    X.images.assign(ni, {XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR});
    XRCHK(xrEnumerateSwapchainImages(X.swapchain, ni, &ni, (XrSwapchainImageBaseHeader*)X.images.data()));
    LOGI("swapchain %dx%d x2 layers, %u images, format 0x%x", X.w, X.h, ni, (unsigned)fmt);

    // fixed foveated rendering: fewer pixels shaded in the periphery
    if (X.extFoveation) {
        PFN_xrCreateFoveationProfileFB createProfile = nullptr; PFN_xrDestroyFoveationProfileFB destroyProfile = nullptr; PFN_xrUpdateSwapchainFB updateSwapchain = nullptr;
        xrGetInstanceProcAddr(X.instance, "xrCreateFoveationProfileFB", (PFN_xrVoidFunction*)&createProfile);
        xrGetInstanceProcAddr(X.instance, "xrDestroyFoveationProfileFB", (PFN_xrVoidFunction*)&destroyProfile);
        xrGetInstanceProcAddr(X.instance, "xrUpdateSwapchainFB", (PFN_xrVoidFunction*)&updateSwapchain);
        if (createProfile && destroyProfile && updateSwapchain) {
            XrFoveationLevelProfileCreateInfoFB lvl = {XR_TYPE_FOVEATION_LEVEL_PROFILE_CREATE_INFO_FB};
            lvl.level = XR_FOVEATION_LEVEL_MEDIUM_FB; lvl.verticalOffset = 0; lvl.dynamic = XR_FOVEATION_DYNAMIC_DISABLED_FB;
            XrFoveationProfileCreateInfoFB pci = {XR_TYPE_FOVEATION_PROFILE_CREATE_INFO_FB}; pci.next = &lvl;
            XrFoveationProfileFB profile = XR_NULL_HANDLE;
            if (XR_SUCCEEDED(createProfile(X.session, &pci, &profile))) {
                XrSwapchainStateFoveationFB st = {XR_TYPE_SWAPCHAIN_STATE_FOVEATION_FB}; st.profile = profile;
                XRWARN(updateSwapchain(X.swapchain, (const XrSwapchainStateBaseHeaderFB*)&st));
                destroyProfile(profile);
            }
        }
    }

    // ---- input: Touch controllers (and the generic simple controller as a fallback)
    XrActionSetCreateInfo asi = {XR_TYPE_ACTION_SET_CREATE_INFO}; strcpy(asi.actionSetName, "ride"); strcpy(asi.localizedActionSetName, "Ride");
    XRCHK(xrCreateActionSet(X.instance, &asi, &X.actionSet));
    xrStringToPath(X.instance, "/user/hand/left", &X.handPath[0]); xrStringToPath(X.instance, "/user/hand/right", &X.handPath[1]);
    auto mk = [&](XrAction& a, const char* name, const char* loc, XrActionType type) {
        XrActionCreateInfo ac = {XR_TYPE_ACTION_CREATE_INFO}; ac.actionType = type; strcpy(ac.actionName, name); strcpy(ac.localizedActionName, loc);
        ac.countSubactionPaths = 2; ac.subactionPaths = X.handPath;
        XrResult rr = xrCreateAction(X.actionSet, &ac, &a); if (XR_FAILED(rr)) LOGE("xrCreateAction %s failed %d", name, (int)rr);
    };
    mk(X.aTrigger, "trigger", "Select", XR_ACTION_TYPE_FLOAT_INPUT); mk(X.aStick, "stick", "Turn", XR_ACTION_TYPE_VECTOR2F_INPUT);
    mk(X.aA, "button_a", "Info", XR_ACTION_TYPE_BOOLEAN_INPUT); mk(X.aB, "button_b", "Menu", XR_ACTION_TYPE_BOOLEAN_INPUT);
    mk(X.aMenu, "menu", "Menu button", XR_ACTION_TYPE_BOOLEAN_INPUT); mk(X.aAim, "aim", "Pointer", XR_ACTION_TYPE_POSE_INPUT);
    auto path = [&](const char* s) { XrPath p = XR_NULL_PATH; xrStringToPath(X.instance, s, &p); return p; };
    {
        std::vector<XrActionSuggestedBinding> b = {
            {X.aTrigger, path("/user/hand/left/input/trigger/value")}, {X.aTrigger, path("/user/hand/right/input/trigger/value")},
            {X.aStick, path("/user/hand/left/input/thumbstick")}, {X.aStick, path("/user/hand/right/input/thumbstick")},
            {X.aA, path("/user/hand/left/input/x/click")}, {X.aA, path("/user/hand/right/input/a/click")},
            {X.aB, path("/user/hand/left/input/y/click")}, {X.aB, path("/user/hand/right/input/b/click")},
            {X.aMenu, path("/user/hand/left/input/menu/click")},
            {X.aAim, path("/user/hand/left/input/aim/pose")}, {X.aAim, path("/user/hand/right/input/aim/pose")}};
        XrInteractionProfileSuggestedBinding sb = {XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING};
        sb.interactionProfile = path("/interaction_profiles/oculus/touch_controller"); sb.suggestedBindings = b.data(); sb.countSuggestedBindings = (uint32_t)b.size();
        XRWARN(xrSuggestInteractionProfileBindings(X.instance, &sb));
    }
    {
        std::vector<XrActionSuggestedBinding> b = {
            {X.aTrigger, path("/user/hand/left/input/select/click")}, {X.aTrigger, path("/user/hand/right/input/select/click")},
            {X.aMenu, path("/user/hand/left/input/menu/click")}, {X.aMenu, path("/user/hand/right/input/menu/click")},
            {X.aAim, path("/user/hand/left/input/aim/pose")}, {X.aAim, path("/user/hand/right/input/aim/pose")}};
        XrInteractionProfileSuggestedBinding sb = {XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING};
        sb.interactionProfile = path("/interaction_profiles/khr/simple_controller"); sb.suggestedBindings = b.data(); sb.countSuggestedBindings = (uint32_t)b.size();
        XRWARN(xrSuggestInteractionProfileBindings(X.instance, &sb));
    }
    XrSessionActionSetsAttachInfo at = {XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; at.countActionSets = 1; at.actionSets = &X.actionSet;
    XRCHK(xrAttachSessionActionSets(X.session, &at));
    for (int hnd = 0; hnd < 2; hnd++) {
        XrActionSpaceCreateInfo sp = {XR_TYPE_ACTION_SPACE_CREATE_INFO}; sp.action = X.aAim; sp.subactionPath = X.handPath[hnd]; sp.poseInActionSpace.orientation.w = 1;
        XRWARN(xrCreateActionSpace(X.session, &sp, &X.aimSpace[hnd]));
    }
    return true;
}

static void pollXrEvents() {
    XrEventDataBuffer ev = {XR_TYPE_EVENT_DATA_BUFFER};
    while (xrPollEvent(X.instance, &ev) == XR_SUCCESS) {
        switch (ev.type) {
            case XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED: {
                auto* e = (XrEventDataSessionStateChanged*)&ev; X.state = e->state;
                LOGI("session state -> %d", (int)e->state);
                if (e->state == XR_SESSION_STATE_READY) {
                    XrSessionBeginInfo bi = {XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
                    if (XR_SUCCEEDED(xrBeginSession(X.session, &bi))) {
                        X.sessionRunning = true;
                        if (X.extPerf) {
                            PFN_xrPerfSettingsSetPerformanceLevelEXT setLevel = nullptr;
                            xrGetInstanceProcAddr(X.instance, "xrPerfSettingsSetPerformanceLevelEXT", (PFN_xrVoidFunction*)&setLevel);
                            if (setLevel) { setLevel(X.session, XR_PERF_SETTINGS_DOMAIN_CPU_EXT, XR_PERF_SETTINGS_LEVEL_SUSTAINED_HIGH_EXT); setLevel(X.session, XR_PERF_SETTINGS_DOMAIN_GPU_EXT, XR_PERF_SETTINGS_LEVEL_SUSTAINED_HIGH_EXT); }
                        }
                    }
                } else if (e->state == XR_SESSION_STATE_STOPPING) { X.sessionRunning = false; xrEndSession(X.session); }
                else if (e->state == XR_SESSION_STATE_EXITING || e->state == XR_SESSION_STATE_LOSS_PENDING) { X.sessionRunning = false; X.exitRequested = true; }
                X.focused = (e->state == XR_SESSION_STATE_FOCUSED);
                break;
            }
            case XR_TYPE_EVENT_DATA_INSTANCE_LOSS_PENDING: X.exitRequested = true; break;
            default: break;
        }
        ev = {XR_TYPE_EVENT_DATA_BUFFER};
    }
}

static void readInput(AppInput& in, XrTime t) {
    if (!X.focused) return;
    XrActiveActionSet aas = {X.actionSet, XR_NULL_PATH};
    XrActionsSyncInfo si = {XR_TYPE_ACTIONS_SYNC_INFO}; si.countActiveActionSets = 1; si.activeActionSets = &aas;
    if (XR_FAILED(xrSyncActions(X.session, &si))) return;
    for (int hnd = 0; hnd < 2; hnd++) {
        HandState& hs = in.hand[hnd];
        XrActionStateGetInfo gi = {XR_TYPE_ACTION_STATE_GET_INFO}; gi.subactionPath = X.handPath[hnd];
        XrActionStateFloat f = {XR_TYPE_ACTION_STATE_FLOAT}; gi.action = X.aTrigger;
        if (XR_SUCCEEDED(xrGetActionStateFloat(X.session, &gi, &f)) && f.isActive) hs.trigger = f.currentState;
        XrActionStateVector2f v = {XR_TYPE_ACTION_STATE_VECTOR2F}; gi.action = X.aStick;
        if (XR_SUCCEEDED(xrGetActionStateVector2f(X.session, &gi, &v)) && v.isActive) { hs.stickX = v.currentState.x; hs.stickY = v.currentState.y; }
        XrActionStateBoolean b = {XR_TYPE_ACTION_STATE_BOOLEAN}; gi.action = X.aA;
        if (XR_SUCCEEDED(xrGetActionStateBoolean(X.session, &gi, &b)) && b.isActive) hs.btnA = b.currentState;
        b = {XR_TYPE_ACTION_STATE_BOOLEAN}; gi.action = X.aB;
        if (XR_SUCCEEDED(xrGetActionStateBoolean(X.session, &gi, &b)) && b.isActive) hs.btnB = b.currentState;
        b = {XR_TYPE_ACTION_STATE_BOOLEAN}; gi.action = X.aMenu;
        if (XR_SUCCEEDED(xrGetActionStateBoolean(X.session, &gi, &b)) && b.isActive && b.currentState) in.menu = true;
        if (X.aimSpace[hnd] != XR_NULL_HANDLE) {
            XrSpaceLocation loc = {XR_TYPE_SPACE_LOCATION};
            if (XR_SUCCEEDED(xrLocateSpace(X.aimSpace[hnd], X.localSpace, t, &loc)) &&
                (loc.locationFlags & XR_SPACE_LOCATION_POSITION_VALID_BIT) && (loc.locationFlags & XR_SPACE_LOCATION_ORIENTATION_VALID_BIT)) {
                hs.valid = true; hs.pos = Vec3(loc.pose.position.x, loc.pose.position.y, loc.pose.position.z);
                hs.rot = Quat{loc.pose.orientation.x, loc.pose.orientation.y, loc.pose.orientation.z, loc.pose.orientation.w};
            }
        }
    }
}

static void localClock(App& app) {
    time_t now = time(nullptr); struct tm lt; localtime_r(&now, &lt);
    app.month = lt.tm_mon + 1; app.dayOfYear = lt.tm_yday + 1; app.nowClock = lt.tm_hour + lt.tm_min / 60.0 + lt.tm_sec / 3600.0;
}

void android_main(android_app* app) {
    gApp = app;
    JNIEnv* env = nullptr; app->activity->vm->AttachCurrentThread(&env, nullptr);
    app->onAppCmd = onAppCmd;
    LOGI("android_main start");
    App* game = new App();
    bool ok = initEGL() && initXrInstance(app) && initXrSession();
    if (ok) {
        localClock(*game);
        ok = game->init();
        if (ok) {
            Gfx& g = Gfx::get();
            X.rt.init(X.w, X.h, g.msaaMultiview ? 4 : 1);
            game->ren.a2c = X.rt.samples > 1;
            AppInput warm; warm.dt = 0; game->update(warm, true);      // build the surroundings before the first frame
        }
    }
    if (!ok) LOGE("initialisation failed - exiting");
    XrTime lastTime = 0;
    while (ok && !app->destroyRequested && !X.exitRequested) {
        // Android events
        for (;;) {
            int events = 0; android_poll_source* src = nullptr;
            int timeout = (!X.resumed && !X.sessionRunning) ? 250 : 0;
            int id = ALooper_pollOnce(timeout, nullptr, &events, (void**)&src);
            if (id < 0) break;
            if (src) src->process(app, src);
            if (app->destroyRequested) break;
        }
        if (app->destroyRequested) break;
        pollXrEvents();
        if (!X.sessionRunning) { usleep(20000); continue; }

        XrFrameWaitInfo wi = {XR_TYPE_FRAME_WAIT_INFO}; XrFrameState fs = {XR_TYPE_FRAME_STATE};
        if (XR_FAILED(xrWaitFrame(X.session, &wi, &fs))) continue;
        XrFrameBeginInfo bi = {XR_TYPE_FRAME_BEGIN_INFO};
        if (XR_FAILED(xrBeginFrame(X.session, &bi))) continue;

        XrCompositionLayerProjectionView pv[2] = {{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}, {XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}};
        XrCompositionLayerProjection layer = {XR_TYPE_COMPOSITION_LAYER_PROJECTION};
        const XrCompositionLayerBaseHeader* layers[1]; uint32_t layerCount = 0;
        if (fs.shouldRender) {
            XrView views[2] = {{XR_TYPE_VIEW}, {XR_TYPE_VIEW}}; XrViewState vs = {XR_TYPE_VIEW_STATE}; uint32_t nv = 0;
            XrViewLocateInfo li = {XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime = fs.predictedDisplayTime; li.space = X.localSpace;
            XrResult lr = xrLocateViews(X.session, &li, &vs, 2, &nv, views);
            bool valid = XR_SUCCEEDED(lr) && nv == 2 && (vs.viewStateFlags & XR_VIEW_STATE_ORIENTATION_VALID_BIT) && (vs.viewStateFlags & XR_VIEW_STATE_POSITION_VALID_BIT);
            if (valid) {
                AppInput in;
                double dt = lastTime ? (double)(fs.predictedDisplayTime - lastTime) * 1e-9 : 1.0 / 72;
                lastTime = fs.predictedDisplayTime; in.dt = dt < 0 ? 0 : (dt > 0.25 ? 0.25 : dt);
                for (int e = 0; e < 2; e++) {
                    in.eye[e].pos = Vec3(views[e].pose.position.x, views[e].pose.position.y, views[e].pose.position.z);
                    in.eye[e].rot = Quat{views[e].pose.orientation.x, views[e].pose.orientation.y, views[e].pose.orientation.z, views[e].pose.orientation.w};
                    in.eye[e].tanL = tanf(views[e].fov.angleLeft); in.eye[e].tanR = tanf(views[e].fov.angleRight);
                    in.eye[e].tanU = tanf(views[e].fov.angleUp); in.eye[e].tanD = tanf(views[e].fov.angleDown);
                }
                readInput(in, fs.predictedDisplayTime);
                localClock(*game);
                game->update(in, false);
                uint32_t idx = 0; XrSwapchainImageAcquireInfo aq = {XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
                if (XR_SUCCEEDED(xrAcquireSwapchainImage(X.swapchain, &aq, &idx))) {
                    XrSwapchainImageWaitInfo ww = {XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; ww.timeout = XR_INFINITE_DURATION;
                    if (XR_SUCCEEDED(xrWaitSwapchainImage(X.swapchain, &ww))) {
                        game->render(X.rt, X.images[idx].image, in);
                        for (int e = 0; e < 2; e++) {
                            pv[e].pose = views[e].pose; pv[e].fov = views[e].fov;
                            pv[e].subImage.swapchain = X.swapchain; pv[e].subImage.imageRect.offset = {0, 0}; pv[e].subImage.imageRect.extent = {X.w, X.h};
                            pv[e].subImage.imageArrayIndex = (uint32_t)e;
                        }
                        layer.space = X.localSpace; layer.viewCount = 2; layer.views = pv;
                        layers[0] = (const XrCompositionLayerBaseHeader*)&layer; layerCount = 1;
                    }
                    XrSwapchainImageReleaseInfo ri = {XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO};
                    xrReleaseSwapchainImage(X.swapchain, &ri);
                }
            }
        } else lastTime = 0;
        XrFrameEndInfo ei = {XR_TYPE_FRAME_END_INFO}; ei.displayTime = fs.predictedDisplayTime; ei.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
        ei.layerCount = layerCount; ei.layers = layerCount ? layers : nullptr;
        XRWARN(xrEndFrame(X.session, &ei));
        if (!X.resumed || !X.focused) game->onPause();
    }
    LOGI("android_main exit");
    if (ok) { game->onPause(); game->shutdown(); }
    if (X.session != XR_NULL_HANDLE) xrDestroySession(X.session);
    if (X.instance != XR_NULL_HANDLE) xrDestroyInstance(X.instance);
    if (X.dpy != EGL_NO_DISPLAY) { eglMakeCurrent(X.dpy, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT); eglTerminate(X.dpy); }
    ANativeActivity_finish(app->activity);
    app->activity->vm->DetachCurrentThread();
    // NativeActivity keeps the process alive after finishing; make sure a relaunch starts clean.
    exit(0);
}
