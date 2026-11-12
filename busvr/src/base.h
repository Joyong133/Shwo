// Math + small utilities shared by everything.
#pragma once
#include <cmath>
#include <cstdint>
#include <cstring>
#include <cstdio>
#include <string>
#include <vector>
#include <algorithm>

#if defined(__ANDROID__)
#include <android/log.h>
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "BusVR", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "BusVR", __VA_ARGS__)
#else
#define LOGI(...) do { fprintf(stderr, __VA_ARGS__); fputc('\n', stderr); } while (0)
#define LOGE(...) do { fprintf(stderr, "ERROR: "); fprintf(stderr, __VA_ARGS__); fputc('\n', stderr); } while (0)
#endif

static const float PI = 3.14159265358979f;
inline float clampf(float v, float a, float b) { return v < a ? a : (v > b ? b : v); }
inline float lerpf(float a, float b, float t) { return a + (b - a) * t; }
inline float sstep(float a, float b, float v) { float t = clampf((v - a) / (b - a), 0.f, 1.f); return t * t * (3.f - 2.f * t); }
inline float sat(float v) { return clampf(v, 0.f, 1.f); }
inline float radf(float d) { return d * PI / 180.f; }

struct Vec3 {
    float x = 0, y = 0, z = 0;
    Vec3() {}
    Vec3(float a, float b, float c) : x(a), y(b), z(c) {}
    Vec3 operator+(const Vec3& o) const { return {x + o.x, y + o.y, z + o.z}; }
    Vec3 operator-(const Vec3& o) const { return {x - o.x, y - o.y, z - o.z}; }
    Vec3 operator*(float s) const { return {x * s, y * s, z * s}; }
    Vec3 operator*(const Vec3& o) const { return {x * o.x, y * o.y, z * o.z}; }
    Vec3 operator-() const { return {-x, -y, -z}; }
    Vec3& operator+=(const Vec3& o) { x += o.x; y += o.y; z += o.z; return *this; }
};
inline float dot(const Vec3& a, const Vec3& b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
inline Vec3 cross(const Vec3& a, const Vec3& b) { return {a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x}; }
inline float length(const Vec3& a) { return sqrtf(dot(a, a)); }
inline Vec3 normalize(const Vec3& a) { float l = length(a); return l > 1e-12f ? a * (1.f / l) : Vec3(0, 1, 0); }
inline Vec3 lerp(const Vec3& a, const Vec3& b, float t) { return a + (b - a) * t; }

struct Vec3d {
    double x = 0, y = 0, z = 0;
    Vec3d() {}
    Vec3d(double a, double b, double c) : x(a), y(b), z(c) {}
    Vec3d operator+(const Vec3d& o) const { return {x + o.x, y + o.y, z + o.z}; }
    Vec3d operator-(const Vec3d& o) const { return {x - o.x, y - o.y, z - o.z}; }
    Vec3d operator*(double s) const { return {x * s, y * s, z * s}; }
    Vec3 f() const { return {(float)x, (float)y, (float)z}; }
};

struct Quat { float x = 0, y = 0, z = 0, w = 1; };
inline Vec3 rotate(const Quat& q, const Vec3& v) {
    Vec3 u(q.x, q.y, q.z);
    Vec3 t = cross(u, v) * 2.f;
    return v + t * q.w + cross(u, t);
}

// Column-major 4x4, same layout as OpenGL.
struct Mat4 {
    float m[16];
    static Mat4 identity() { Mat4 r; memset(r.m, 0, sizeof(r.m)); r.m[0] = r.m[5] = r.m[10] = r.m[15] = 1; return r; }
    static Mat4 translate(const Vec3& t) { Mat4 r = identity(); r.m[12] = t.x; r.m[13] = t.y; r.m[14] = t.z; return r; }
    static Mat4 scale(const Vec3& s) { Mat4 r = identity(); r.m[0] = s.x; r.m[5] = s.y; r.m[10] = s.z; return r; }
    static Mat4 rotY(float a) { Mat4 r = identity(); float c = cosf(a), s = sinf(a); r.m[0] = c; r.m[2] = -s; r.m[8] = s; r.m[10] = c; return r; }
    static Mat4 rotX(float a) { Mat4 r = identity(); float c = cosf(a), s = sinf(a); r.m[5] = c; r.m[6] = s; r.m[9] = -s; r.m[10] = c; return r; }
    static Mat4 rotZ(float a) { Mat4 r = identity(); float c = cosf(a), s = sinf(a); r.m[0] = c; r.m[1] = s; r.m[4] = -s; r.m[5] = c; return r; }
    static Mat4 basis(const Vec3& x, const Vec3& y, const Vec3& z, const Vec3& t) {
        Mat4 r = identity();
        r.m[0] = x.x; r.m[1] = x.y; r.m[2] = x.z; r.m[4] = y.x; r.m[5] = y.y; r.m[6] = y.z; r.m[8] = z.x; r.m[9] = z.y; r.m[10] = z.z;
        r.m[12] = t.x; r.m[13] = t.y; r.m[14] = t.z; return r;
    }
    static Mat4 fromQuat(const Quat& q, const Vec3& t) {
        return basis(rotate(q, Vec3(1, 0, 0)), rotate(q, Vec3(0, 1, 0)), rotate(q, Vec3(0, 0, 1)), t);
    }
    // Asymmetric frustum from tangent half-angles (OpenXR fov), GL clip space.
    static Mat4 frustumTan(float l, float r, float d, float u, float n, float f) {
        Mat4 p; memset(p.m, 0, sizeof(p.m));
        p.m[0] = 2.f / (r - l); p.m[5] = 2.f / (u - d);
        p.m[8] = (r + l) / (r - l); p.m[9] = (u + d) / (u - d);
        p.m[10] = -(f + n) / (f - n); p.m[11] = -1.f; p.m[14] = -2.f * f * n / (f - n);
        return p;
    }
    Mat4 operator*(const Mat4& o) const {
        Mat4 r;
        for (int c = 0; c < 4; c++)
            for (int rr = 0; rr < 4; rr++)
                r.m[c * 4 + rr] = m[rr] * o.m[c * 4] + m[4 + rr] * o.m[c * 4 + 1] + m[8 + rr] * o.m[c * 4 + 2] + m[12 + rr] * o.m[c * 4 + 3];
        return r;
    }
    Vec3 point(const Vec3& v) const { return {m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12], m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13], m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14]}; }
    Vec3 dir(const Vec3& v) const { return {m[0] * v.x + m[4] * v.y + m[8] * v.z, m[1] * v.x + m[5] * v.y + m[9] * v.z, m[2] * v.x + m[6] * v.y + m[10] * v.z}; }
    // Inverse of a rigid transform (rotation + translation only).
    Mat4 rigidInverse() const {
        Mat4 r = identity();
        for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) r.m[i * 4 + j] = m[j * 4 + i];
        Vec3 t(m[12], m[13], m[14]);
        Vec3 it = r.dir(t);
        r.m[12] = -it.x; r.m[13] = -it.y; r.m[14] = -it.z;
        return r;
    }
    Mat4 inverse() const;   // general 4x4
};
inline Mat4 Mat4::inverse() const {
    Mat4 inv; const float* a = m; float* o = inv.m;
    o[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
    o[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
    o[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
    o[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
    o[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
    o[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
    o[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
    o[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
    o[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
    o[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
    o[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
    o[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
    o[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
    o[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
    o[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
    o[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
    float det = a[0] * o[0] + a[1] * o[4] + a[2] * o[8] + a[3] * o[12];
    det = fabsf(det) > 1e-20f ? 1.f / det : 0.f;
    for (int i = 0; i < 16; i++) o[i] *= det;
    return inv;
}

// Deterministic hashing / random numbers (scenery must look the same every time a chunk reloads).
inline uint32_t hash32(uint32_t x) { x ^= x >> 16; x *= 0x7feb352dU; x ^= x >> 15; x *= 0x846ca68bU; x ^= x >> 16; return x; }
inline uint32_t hash2(int32_t a, int32_t b) { return hash32((uint32_t)a * 0x9E3779B1U ^ hash32((uint32_t)b + 0x85EBCA6BU)); }
inline float hashf(uint32_t h) { return (hash32(h) & 0xFFFFFF) / 16777216.f; }
struct Rng {
    uint32_t s;
    explicit Rng(uint32_t seed) : s(seed ? seed : 1) {}
    uint32_t next() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
    float f() { return (next() & 0xFFFFFF) / 16777216.f; }
    float range(float a, float b) { return a + (b - a) * f(); }
    int irange(int a, int b) { return a + (int)(next() % (uint32_t)(b - a + 1)); }
};
// Smooth 2D value noise in [0,1].
inline float vnoise(float x, float y) {
    float fx = floorf(x), fy = floorf(y); int ix = (int)fx, iy = (int)fy; float tx = x - fx, ty = y - fy;
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
    float a = hashf(hash2(ix, iy)), b = hashf(hash2(ix + 1, iy)), c = hashf(hash2(ix, iy + 1)), d = hashf(hash2(ix + 1, iy + 1));
    return lerpf(lerpf(a, b, tx), lerpf(c, d, tx), ty);
}
inline float fbm(float x, float y, int oct = 4) { float s = 0, a = 0.5f; for (int i = 0; i < oct; i++) { s += a * vnoise(x, y); x *= 2.03f; y *= 2.03f; a *= 0.5f; } return s; }

struct Color { float r, g, b; };
inline Vec3 rgb(int hex) { return Vec3(((hex >> 16) & 255) / 255.f, ((hex >> 8) & 255) / 255.f, (hex & 255) / 255.f); }
// sRGB (authoring) -> linear (what the shaders work in).
inline float toLin(float c) { return c <= 0.04045f ? c / 12.92f : powf((c + 0.055f) / 1.055f, 2.4f); }
inline Vec3 lin(int hex) { Vec3 c = rgb(hex); return Vec3(toLin(c.x), toLin(c.y), toLin(c.z)); }
inline Vec3 lin(const Vec3& c) { return Vec3(toLin(c.x), toLin(c.y), toLin(c.z)); }
