// Environment (sun, sky, season) and the scene renderer.
#pragma once
#include "world.h"

struct Env {
    // inputs
    int month = 11, dayOfYear = 315; double clockHours = 14.0; double lon = 127.0, lat = 37.5;
    float cloud = 0.35f; float tunnel = 0;         // 0..1 how deep inside a tunnel the bus is
    // derived
    Vec3 sunDir; float sunElev = 0, night = 0, starVis = 0;
    Vec3 sunColor, skyAmb, groundAmb, fogColor, fogSun, zenith, horizon, cabin; float fogDensity = 0, fogSunAmt = 0;
    Vec3 tintGrass, tintForest, tintCrop, tintUrban, tintRock, tintDecid, tintEver, tintGinkgo;
    void update();
    void fill(FrameUBO& f) const;
};

struct DrawStats { int chunks = 0, tris = 0, draws = 0; };

struct Renderer {
    Shader lit, terrNear, terrFar, road, bill, sky, text;
    GLuint texTerrain = 0, texAsphalt = 0, texTrees = 0, texFacade = 0, texInterior = 0, texClouds = 0;
    Mesh skyTri;
    bool a2c = false;                 // alpha-to-coverage for foliage (only with MSAA)
    DrawStats stats;
    bool init();
    // camOrigin: world position all matrices are relative to; viewFwd: head direction for culling
    void drawWorldOpaque(World& w, const Env& env, const Vec3d& camOrigin, const Vec3& viewFwd);
    void drawSky();
    void drawWorldAlpha(World& w, const Env& env, const Vec3d& camOrigin, const Vec3& viewFwd, Font& font);
    // generic helpers for the app (bus, vehicles, UI)
    void drawLit(const Mesh& m, const Mat4& model, GLuint texArray, float gain = 1.f);
    void drawText(const Mesh& m, const Mat4& model, Font& font);
    bool visible(const Chunk& c, const Vec3d& camOrigin, const Vec3& viewFwd, Vec3& rel) const;
};
