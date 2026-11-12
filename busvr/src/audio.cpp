#include "audio.h"
#ifdef __ANDROID__
#include <aaudio/AAudio.h>
#endif

void Synth::render(float* out, int frames) {
    if (delay.empty()) delay.assign((size_t)(rate * 0.085f), 0.f);
    float tSpeed = speed.load(), tAccel = accel.load(), tTunnel = tunnel.load(), tActive = active.load(), vol = volume.load();
    int ev = events.exchange(0);
    if (ev & AE_CHIME) chimeT = 0; if (ev & AE_DOOR) doorT = 0; if (ev & AE_BUMP) bumpT = 0; if (ev & AE_TICK) tickT = 0;
    const float dt = 1.f / rate, TWO_PI = 6.2831853f;
    for (int i = 0; i < frames; i++) {
        sSpeed += (tSpeed - sSpeed) * 0.0004f; sAccel += (tAccel - sAccel) * 0.0004f; sTunnel += (tTunnel - sTunnel) * 0.0002f; sActive += (tActive - sActive) * 0.0002f;
        float v = sSpeed, vn = clampf(v / 30.f, 0.f, 1.3f);
        // engine: six-cylinder diesel, revs follow a simple gearbox
        float gear = v < 4 ? v / 4 : (v < 9 ? (v - 4) / 5 : (v < 16 ? (v - 9) / 7 : (v < 24 ? (v - 16) / 8 : 0.55f + (v - 24) / 30)));
        float rev = 0.22f + 0.6f * clampf(gear, 0.f, 1.f) + 0.12f * clampf(sAccel, 0.f, 1.f);
        float f0 = 30.f + 52.f * rev;
        static const float hm[6] = {0.5f, 1.0f, 1.5f, 2.0f, 3.0f, 4.5f}, ha[6] = {0.55f, 1.0f, 0.45f, 0.5f, 0.22f, 0.10f};
        float eng = 0;
        for (int h = 0; h < 6; h++) { ph[h] += f0 * hm[h] * dt; if (ph[h] > 1) ph[h] -= 1; eng += ha[h] * sinf(ph[h] * TWO_PI); }
        float n = noise();
        lp1 += (n - lp1) * 0.012f;                         // ~90 Hz rumble
        lp2 += (n - lp2) * 0.09f;                          // ~700 Hz tyre roar
        hp1 += (n - hp1) * 0.35f; float hiss = n - hp1;    // wind / air-con hiss
        windMod += (noise() - windMod) * 0.00005f;
        float engAmp = (0.050f + 0.030f * clampf(sAccel, 0.f, 1.f) + 0.02f * (1.f - clampf(vn, 0.f, 1.f))) * sActive;
        float road = (lp1 * 2.2f + lp2 * 0.55f) * 0.16f * powf(vn, 1.3f) * (1.f + 0.7f * sTunnel);
        float wind = hiss * (0.012f * sActive + 0.030f * vn * vn * (1.f + 3.f * windMod)) * (1.f - 0.5f * sTunnel);
        float s = eng * engAmp + lp1 * 0.8f * engAmp + road + wind;
        // events
        if (chimeT >= 0) {
            float t = chimeT; float a = 0;
            if (t < 1.1f) a += sinf(TWO_PI * 659.3f * t) * expf(-t * 3.2f) + 0.3f * sinf(TWO_PI * 1318.5f * t) * expf(-t * 5.f);
            if (t > 0.55f) { float u = t - 0.55f; a += sinf(TWO_PI * 523.3f * u) * expf(-u * 2.6f) + 0.3f * sinf(TWO_PI * 1046.5f * u) * expf(-u * 4.f); }
            s += a * 0.16f; chimeT += dt; if (chimeT > 2.6f) chimeT = -1;
        }
        if (doorT >= 0) { s += hiss * 0.5f * expf(-doorT * 4.5f) * (doorT < 0.03f ? doorT / 0.03f : 1.f); doorT += dt; if (doorT > 1.4f) doorT = -1; }
        if (bumpT >= 0) {
            float t = bumpT; float a = sinf(TWO_PI * 58.f * t) * expf(-t * 22.f);
            if (t > 0.13f) a += sinf(TWO_PI * 52.f * (t - 0.13f)) * expf(-(t - 0.13f) * 22.f);
            s += a * 0.30f; bumpT += dt; if (bumpT > 0.6f) bumpT = -1;
        }
        if (tickT >= 0) { s += sinf(TWO_PI * 1900.f * tickT) * expf(-tickT * 160.f) * 0.10f; tickT += dt; if (tickT > 0.08f) tickT = -1; }
        // tunnel: a short feedback delay gives the boxed-in boom
        float d = delay[dpos]; float wet = s + d * 0.55f * sTunnel;
        delay[dpos] = wet; if (++dpos >= (int)delay.size()) dpos = 0;
        float o = tanhf((s + d * 0.5f * sTunnel) * 1.6f * vol);
        lp3 += (o - lp3) * 0.6f;
        // tiny stereo spread: tyres slightly decorrelated left / right
        float sp = lp2 * 0.02f * vn;
        out[i * 2] = lp3 + sp; out[i * 2 + 1] = lp3 - sp;
    }
}

#ifdef __ANDROID__
static aaudio_data_callback_result_t audioCb(AAudioStream*, void* user, void* data, int32_t frames) {
    ((Synth*)user)->render((float*)data, frames); return AAUDIO_CALLBACK_RESULT_CONTINUE;
}
bool Audio::start() {
    AAudioStreamBuilder* b = nullptr;
    if (AAudio_createStreamBuilder(&b) != AAUDIO_OK) return false;
    AAudioStreamBuilder_setFormat(b, AAUDIO_FORMAT_PCM_FLOAT); AAudioStreamBuilder_setChannelCount(b, 2);
    AAudioStreamBuilder_setSampleRate(b, 48000); AAudioStreamBuilder_setPerformanceMode(b, AAUDIO_PERFORMANCE_MODE_NONE);
    AAudioStreamBuilder_setDataCallback(b, audioCb, &synth);
    AAudioStream* s = nullptr; aaudio_result_t r = AAudioStreamBuilder_openStream(b, &s);
    AAudioStreamBuilder_delete(b);
    if (r != AAUDIO_OK || !s) { LOGE("AAudio open failed: %d", (int)r); return false; }
    synth.rate = (float)AAudioStream_getSampleRate(s);
    stream = s;
    AAudioStream_requestStart(s);
    LOGI("audio started at %.0f Hz", synth.rate);
    return true;
}
void Audio::stop() { if (stream) { AAudioStream_requestStop((AAudioStream*)stream); AAudioStream_close((AAudioStream*)stream); stream = nullptr; } }
void Audio::setPaused(bool p) { if (!stream) return; if (p) AAudioStream_requestPause((AAudioStream*)stream); else AAudioStream_requestStart((AAudioStream*)stream); }
#else
bool Audio::start() { return true; }
void Audio::stop() {}
void Audio::setPaused(bool) {}
#endif
