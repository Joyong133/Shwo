// Procedural cabin sound: engine, tyres, wind, tunnel boom, chimes. No audio assets needed.
#pragma once
#include "base.h"
#include <atomic>

enum AudioEvent { AE_CHIME = 1, AE_DOOR = 2, AE_BUMP = 4, AE_TICK = 8 };

struct Synth {
    // parameters written by the game thread
    std::atomic<float> speed{0}, accel{0}, tunnel{0}, volume{1}, active{0};
    std::atomic<int> events{0};
    // state (audio thread only)
    float rate = 48000; uint32_t rng = 0x1234567;
    float ph[6] = {0, 0, 0, 0, 0, 0}; float lp1 = 0, lp2 = 0, lp3 = 0, hp1 = 0, windMod = 0, windLp = 0;
    float sSpeed = 0, sAccel = 0, sTunnel = 0, sActive = 0;
    float chimeT = -1, doorT = -1, bumpT = -1, tickT = -1;
    std::vector<float> delay; int dpos = 0;
    void render(float* out, int frames);      // interleaved stereo
    float noise() { rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5; return (rng & 0xFFFFFF) / 8388608.f - 1.f; }
};

struct Audio {
    Synth synth; void* stream = nullptr;
    bool start();
    void stop();
    void setPaused(bool p);
    void trigger(int ev) { synth.events.fetch_or(ev); }
};
