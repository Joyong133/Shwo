#include "render.h"

// ---------------------------------------------------------------- shared GLSL
static const char* kCommon = R"(
vec3 toLin(vec3 c){ return c*(c*(c*0.305306011+0.682171111)+0.012522878); }
vec3 fogCol(vec3 vdir){ float s = max(dot(vdir, uSunDir.xyz), 0.0); return mix(uFogColor.rgb, uFogSun.rgb, pow(s, 6.0) * uFogSun.a); }
float fogAmt(float dist){ return 1.0 - exp(-dist * uFogColor.a); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
)";

static const char* kLitVS = R"(
in vec3 aPos; in vec3 aNrm; in vec4 aCol; in vec3 aUv; in float aMat;
uniform mat4 uModel; uniform vec4 uTint;
out vec3 vCol; out vec3 vUvw; out vec3 vLight; out vec4 vFog; out vec3 vEx; out vec3 vEmis;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  gl_Position = uViewProj[VIEW] * wp;
  vec3 n = normalize(mat3(uModel) * aNrm);
  vec3 toP = wp.xyz - uEyePos[VIEW].xyz; float dist = length(toP); vec3 vdir = toP / max(dist, 0.001);
  int mat = int(aMat + 0.5);
  vec3 alb = toLin(aCol.rgb);
  float night = uSunDir.w;
  float ndl = max(dot(n, uSunDir.xyz), 0.0);
  vec3 amb = mix(uGroundAmb.rgb, uSkyAmb.rgb, n.y * 0.5 + 0.5);
  vec3 light = uSunColor.rgb * ndl + amb;
  vec3 emis = vec3(0.0); float fog = fogAmt(dist); float win = 0.0; float alpha = aCol.a;
  vec3 tunnelLight = vec3(1.0, 0.88, 0.68) * 0.7;
  if (mat == 1) { win = night; alpha = 1.0; }
  else if (mat == 2) { light = vec3(0.0); emis = alb * 1.5; fog *= 0.4; }
  else if (mat == 3) { light = uCabin.rgb * (0.52 + 0.26 * n.y + 0.30 * abs(n.x) + 0.10 * max(-n.z, 0.0)) + uSunColor.rgb * ndl * 0.10 * (1.0 - uTime.w); fog = 0.0; }
  else if (mat == 4) {
    alb *= uTint.rgb;
    vec3 r = reflect(vdir, n); float sp = pow(max(dot(r, uSunDir.xyz), 0.0), 20.0);
    emis = (uSunColor.rgb * sp * 0.35 + uSkyAmb.rgb * 0.12 * pow(1.0 - max(dot(-vdir, n), 0.0), 3.0)) * (1.0 - uTime.w);
    light = mix(light, tunnelLight * (0.6 + 0.4 * n.y), uTime.w);
  }
  else if (mat == 5) { light = tunnelLight * (0.75 + 0.25 * max(-n.y, 0.0)) + amb * 0.1; fog *= 0.3; }
  else if (mat == 6) { emis = alb * night * 1.6; }
  else if (mat == 7) { emis = alb * night * 0.85 * clamp(1.0 - dist / 280.0, 0.0, 1.0); }
  else if (mat == 8) { light = vec3(0.0); emis = alb; fog = 0.0; }
  else if (mat == 9) { light = vec3(1.0); emis = vec3(0.0); fog = 0.0; win = -1.0; }
  vCol = alb; vUvw = aUv; vLight = light; vEmis = emis; vFog = vec4(fogCol(vdir), fog); vEx = vec3(win, aCol.a, alpha);
}
)";
static const char* kLitFS = R"(
uniform sampler2DArray uTex; uniform float uTexGain;
in vec3 vCol; in vec3 vUvw; in vec3 vLight; in vec4 vFog; in vec3 vEx; in vec3 vEmis;
out vec4 oColor;
void main(){
  vec4 tex = texture(uTex, vec3(vUvw.xy, max(vUvw.z, 0.0)));
  tex = mix(vec4(1.0), vec4(tex.rgb * uTexGain, tex.a), step(0.0, vUvw.z));
  vec3 c = vCol * tex.rgb * vLight + vEmis;
  if (vEx.x > 0.001) {
    float h = hash12(floor(vUvw.xy) + vEx.y * 37.0);
    vec3 wc = mix(vec3(1.0, 0.80, 0.52), vec3(0.85, 0.93, 1.0), step(0.78, fract(h * 7.3)));
    c += (1.0 - tex.a) * step(h, 0.36) * vEx.x * wc * 0.85;
  }
  c = mix(c, vFog.rgb, vFog.a);
  oColor = vec4(c, vEx.x < -0.5 ? vEx.z * tex.a : vEx.z);
}
)";

static const char* kTerrVS = R"(
in vec3 aPos; in vec3 aNrm; in vec4 aCol; in vec2 aUv;
uniform mat4 uModel; uniform vec2 uTexOrigin;
out vec4 vW; out vec2 vWB; out vec2 vWorld; out vec3 vLight; out vec4 vFog; out vec2 vDS;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  gl_Position = uViewProj[VIEW] * wp;
  vec3 n = normalize(aNrm);
  vec3 toP = wp.xyz - uEyePos[VIEW].xyz; float dist = length(toP); vec3 vdir = toP / max(dist, 0.001);
  float ndl = max(dot(n, uSunDir.xyz), 0.0);
  vec3 amb = mix(uGroundAmb.rgb, uSkyAmb.rgb, n.y * 0.5 + 0.5);
  vLight = uSunColor.rgb * ndl + amb;
  vW = aCol; vWB = aUv; vWorld = aPos.xz + uTexOrigin;
  vec3 r = reflect(vdir, vec3(0.0, 1.0, 0.0));
  vDS = vec2(dist, pow(max(dot(r, uSunDir.xyz), 0.0), 90.0));
  vFog = vec4(fogCol(vdir), fogAmt(dist));
}
)";
static const char* kTerrFS = R"(
uniform sampler2DArray uTex; uniform vec3 uTint[5];
in vec4 vW; in vec2 vWB; in vec2 vWorld; in vec3 vLight; in vec4 vFog; in vec2 vDS;
out vec4 oColor;
void main(){
  float sum = vW.r + vW.g + vW.b + vW.a + 0.0001;
  vec3 flatc = (uTint[0] * vW.r + uTint[1] * vW.g + uTint[2] * vW.b + uTint[3] * vW.a) / sum;
#ifdef NEAR
  vec3 g = texture(uTex, vec3(vWorld / 12.0, 0.0)).rgb;
  vec3 f = mix(texture(uTex, vec3(vWorld / 28.0, 1.0)).rgb, g * 0.78, 1.0 - smoothstep(40.0, 170.0, vDS.x));
  vec3 c = texture(uTex, vec3(vWorld / 200.0, 2.0)).rgb * (0.7 + 0.6 * g.g);
  vec3 u = texture(uTex, vec3(vWorld / 24.0, 3.0)).rgb;
  vec3 det = (uTint[0] * g * vW.r + uTint[1] * f * vW.g + uTint[2] * c * vW.b + uTint[3] * u * vW.a) * (2.0 / sum);
  vec3 alb = mix(det, flatc, smoothstep(250.0, 1800.0, vDS.x));
#else
  vec3 alb = flatc;
#endif
  alb = mix(alb, uTint[4], vWB.y);
  vec3 col = alb * vLight;
  vec3 water = mix(vec3(0.015, 0.035, 0.045), uSkyHorizon.rgb, 0.55) * (0.35 + 0.65 * clamp(uSunColor.g + uSkyAmb.g, 0.0, 1.0)) + uSunColor.rgb * vDS.y * 1.2;
  col = mix(col, water, clamp(vWB.x * 1.6 - 0.3, 0.0, 1.0));
  col = mix(col, vFog.rgb, vFog.a);
  oColor = vec4(col, 1.0);
}
)";

static const char* kRoadVS = R"(
in vec3 aPos; in vec3 aNrm; in vec4 aCol; in vec3 aUv;
uniform mat4 uModel;
out vec3 vUvw; out vec3 vInfo; out vec3 vLight; out vec4 vFog; out vec3 vRel;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  gl_Position = uViewProj[VIEW] * wp;
  vec3 toP = wp.xyz - uEyePos[VIEW].xyz; float dist = length(toP); vec3 vdir = toP / max(dist, 0.001);
  vLight = uSunColor.rgb * max(uSunDir.y, 0.0) + uSkyAmb.rgb;
  vUvw = aUv; vInfo = aCol.rgb * 255.0; vRel = wp.xyz - uBusPos.xyz;
  vFog = vec4(fogCol(vdir), fogAmt(dist));
}
)";
static const char* kRoadFS = R"(
uniform sampler2D uAsphalt;
in vec3 vUvw; in vec3 vInfo; in vec3 vLight; in vec4 vFog; in vec3 vRel;
out vec4 oColor;
float cov(float d, float hw, float aa){ return (clamp(d + hw, -aa, aa) - clamp(d - hw, -aa, aa)) / (2.0 * aa); }
void main(){
  float u = vUvw.x, v = vUvw.y, W = vUvw.z;
  float aau = max(fwidth(u) * 0.5, 0.0005), aav = max(fwidth(v) * 0.5, 0.0005);
  int style = int(vInfo.y + 0.5); int flags = int(vInfo.z + 0.5); float lanes = floor(vInfo.x + 0.5);
  float grain = texture(uAsphalt, vec2(u, v) * 0.27).r;
  vec3 alb = vec3(0.075) * (0.55 + 0.9 * grain);
  float white = 0.0, yellow = 0.0, blue = 0.0;
  float dash = cov(mod(v + 6.0, 20.0) - 10.0, 4.0, min(aav, 10.0));
  if (style == 0) {
    float L = floor(W / 3.6 + 0.5);
    float inLanes = step(0.0, u) * step(u, W);
    alb *= 1.0 + inLanes * 0.09 * cos(fract(u / 3.6) * 12.566);
    yellow = cov(u - 0.02, 0.075, aau);
    white = cov(u - W, 0.075, aau);
    float k = floor(u / 3.6 + 0.5); float d = u - k * 3.6;
    float valid = step(0.5, k) * step(k, L - 0.5);
    float bl = ((flags & 1) != 0 && k < 1.5) ? 1.0 : 0.0;
    blue = cov(d, 0.10, aau) * valid * bl;
    white += cov(d, 0.075, aau) * dash * valid * (1.0 - bl);
  } else if (style == 1) {
    yellow = cov(u + 3.6, 0.075, aau); white = cov(u - 3.6, 0.075, aau) + cov(u, 0.075, aau) * dash;
  } else if (style == 2) {
    yellow = cov(u - 0.15, 0.055, aau) + cov(u + 0.15, 0.055, aau);
    float au = abs(u); float k = floor(au / 3.3 + 0.5); float d = au - k * 3.3;
    float d2 = cov(mod(v + 2.5, 8.0) - 4.0, 1.5, min(aav, 4.0));
    white = cov(d, 0.07, aau) * d2 * step(0.5, k) * step(k, lanes - 0.5);
    alb *= 1.15;
  } else if (style == 3) {
    alb *= 1.25;
  } else if (style == 4) {
    alb = vec3(0.36, 0.35, 0.33) * (0.75 + 0.5 * grain);
  } else if (style == 5) {
    float gx = cov(fract(u / 0.6) - 0.5, 0.02, aau / 0.6), gy = cov(fract(v / 0.6) - 0.5, 0.02, aav / 0.6);
    alb = vec3(0.34, 0.32, 0.30) * (0.8 + 0.4 * grain) * (1.0 - 0.25 * max(gx, gy));
  } else {
    yellow = cov(u, 0.07, aau);
    white = cov(abs(u) - (W * 0.5 - 0.3), 0.07, aau) + step(10.5, W) * cov(abs(u) - W * 0.25, 0.07, aau) * dash;
    alb *= 1.2;
  }
  alb = mix(alb, vec3(0.60), clamp(white, 0.0, 1.0));
  alb = mix(alb, vec3(0.62, 0.40, 0.03), clamp(yellow, 0.0, 1.0));
  alb = mix(alb, vec3(0.03, 0.15, 0.55), clamp(blue, 0.0, 1.0));
  vec3 light = vLight;
  float night = uSunDir.w;
  float a = dot(vRel, uBusFwd.xyz); float s = dot(vRel, vec3(-uBusFwd.z, 0.0, uBusFwd.x)); float wd = 2.4 + a * 0.11;
  light += vec3(1.0, 0.95, 0.82) * (uBusFwd.w * smoothstep(5.5, 11.0, a) * exp(-a / 36.0) * exp(-s * s / (2.0 * wd * wd)) * 1.4);
  if ((flags & 2) != 0) light += vec3(1.0, 0.76, 0.42) * (night * 0.34 * (0.62 + 0.38 * cos(v * 0.15708)));
  if ((flags & 4) != 0) light = vec3(1.0, 0.88, 0.68) * 0.7;
  vec3 col = alb * light;
  col = mix(col, vFog.rgb, vFog.a);
  oColor = vec4(col, 1.0);
}
)";

static const char* kBillVS = R"(
in vec3 aPos; in vec2 aOff; in vec4 aCol; in vec2 aUv;
uniform mat4 uModel; uniform vec4 uParams; uniform vec3 uTintEver; uniform vec3 uTintDecid; uniform vec3 uTintGinkgo;
out vec2 vUv; out vec3 vCol; out vec4 vFog;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  vec3 mid = 0.5 * (uEyePos[0].xyz + uEyePos[1].xyz);
  vec3 toC = wp.xyz - mid; float dist = length(toC);
  vec3 right = normalize(vec3(-toC.z, 0.0, toC.x));
  vec3 up = vec3(0.0, 1.0, 0.0); float sc = 1.0;
  if (uParams.x > 0.5) { up = normalize(cross(right, toC)); sc = 1.0 + dist / 140.0; }
  wp.xyz += (right * aOff.x + up * aOff.y) * sc;
  gl_Position = uViewProj[VIEW] * wp;
  vec3 vdir = toC / max(dist, 0.001);
  vUv = aUv;
  if (uParams.x > 0.5) {
    vCol = toLin(aCol.rgb) * uSunDir.w * 1.3 * exp(-dist * uFogColor.a * 0.5);
    vFog = vec4(0.0);
  } else {
    vec3 dec = mix(uTintDecid, uTintGinkgo, aCol.g * 0.75);
    vec3 tint = mix(uTintEver, mix(uTintGinkgo, dec, clamp(aCol.a * 2.0 - 1.0, 0.0, 1.0)), step(0.25, aCol.a));
    float sunSide = dot(normalize(-toC.xz + vec2(0.0001)), normalize(uSunDir.xz + vec2(0.0001)));
    vec3 light = uSunColor.rgb * (0.50 + 0.22 * sunSide) * clamp(uSunDir.y * 3.0 + 0.3, 0.0, 1.0) + uSkyAmb.rgb * 0.9;
    vCol = tint * aCol.r * light;
    vFog = vec4(fogCol(vdir), fogAmt(dist));
  }
}
)";
static const char* kBillFS = R"(
uniform sampler2D uTex; uniform vec4 uParams;
in vec2 vUv; in vec3 vCol; in vec4 vFog;
out vec4 oColor;
void main(){
  if (uParams.x > 0.5) {
    float g = max(1.0 - dot(vUv, vUv), 0.0); g = g * g; g = g * g * 0.55 + g * g * g * g * 2.0;
    oColor = vec4(vCol * g, 1.0);
  } else {
    vec4 t = texture(uTex, vUv);
    float a = (t.a - 0.42) / max(fwidth(t.a), 0.0001) + 0.5;
    if (a < (uParams.y > 0.5 ? 0.02 : 0.5)) discard;
    vec3 c = mix(t.rgb * vCol, vFog.rgb, vFog.a);
    oColor = vec4(c, clamp(a, 0.0, 1.0));
  }
}
)";

static const char* kSkyVS = R"(
in vec3 aPos;
out vec3 vDir;
void main(){
  gl_Position = vec4(aPos.xy, 1.0, 1.0);
  vec4 p = uInvViewProj[VIEW] * vec4(aPos.xy, 1.0, 1.0);
  vDir = p.xyz / p.w - uEyePos[VIEW].xyz;
}
)";
static const char* kSkyFS = R"(
uniform sampler2D uClouds;
in vec3 vDir;
out vec4 oColor;
void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  vec3 col = mix(uSkyHorizon.rgb, uSkyZenith.rgb, 1.0 - exp(-h * 3.2));
  float sd = max(dot(d, uSunDir.xyz), 0.0);
  col += uFogSun.rgb * (pow(sd, 10.0) * 0.45 + pow(sd, 90.0) * 0.6) * uFogSun.a;
  col += uSunColor.rgb * smoothstep(0.99965, 0.99985, sd) * 6.0;
  // stars
  if (uMisc.y > 0.01) {
    vec3 q = d * 260.0; vec3 c = floor(q); float s = hash12(c.xy + c.z * 17.3);
    float star = step(0.9965, s) * smoothstep(0.75, 0.2, length(fract(q) - 0.5));
    col += vec3(0.9, 0.95, 1.0) * star * uMisc.y * (0.4 + 0.6 * fract(s * 91.7)) * smoothstep(0.02, 0.2, d.y);
  }
  // clouds on a high flat layer
  vec2 cuv = d.xz / (d.y + 0.09) * 0.11 + uTime.x * vec2(0.0011, 0.0004);
  float n = texture(uClouds, cuv).r * 0.65 + texture(uClouds, cuv * 2.7 + 0.37).r * 0.35;
  float cover = uMisc.x;
  float dens = smoothstep(1.0 - cover - 0.08, 1.0 - cover + 0.30, n) * smoothstep(0.015, 0.16, d.y);
  vec3 cl = (uSunColor.rgb * 0.62 + uSkyAmb.rgb * 0.95) * (0.72 + 0.38 * smoothstep(0.35, 0.8, n)) + uFogSun.rgb * pow(sd, 6.0) * 0.5 * uFogSun.a;
  col = mix(col, cl, dens * 0.9);
  // ground haze below the horizon
  col = mix(col, uFogColor.rgb, smoothstep(0.0, -0.06, d.y));
  oColor = vec4(col, 1.0);
}
)";

static const char* kTextVS = R"(
in vec3 aPos; in vec3 aNrm; in vec4 aCol; in vec3 aUv; in float aMat;
uniform mat4 uModel;
out vec2 vUv; out vec4 vCol; out vec4 vFog;
void main(){
  vec4 wp = uModel * vec4(aPos, 1.0);
  gl_Position = uViewProj[VIEW] * wp;
  vec3 toP = wp.xyz - uEyePos[VIEW].xyz; float dist = length(toP); vec3 vdir = toP / max(dist, 0.001);
  vec3 alb = toLin(aCol.rgb); int mat = int(aMat + 0.5);
  vec3 n = normalize(mat3(uModel) * aNrm);
  vec3 light = uSunColor.rgb * (0.25 + 0.6 * max(dot(n, uSunDir.xyz), 0.0)) + uSkyAmb.rgb;
  float fog = fogAmt(dist);
  vec3 c = alb * light + alb * uSunDir.w * 0.85 * clamp(1.0 - dist / 280.0, 0.0, 1.0);
  if (mat == 2) { c = alb * 1.25; fog *= 0.3; }
  if (mat == 3) { c = alb; fog = 0.0; }
  vUv = aUv.xy; vCol = vec4(c, aCol.a); vFog = vec4(fogCol(vdir), fog);
}
)";
static const char* kTextFS = R"(
uniform sampler2D uFont;
in vec2 vUv; in vec4 vCol; in vec4 vFog;
out vec4 oColor;
void main(){
  float a = texture(uFont, vUv).r;
  float aa = clamp((a - 0.5) / max(fwidth(a) * 1.2, 0.0001) + 0.5, 0.0, 1.0);
  a = mix(a, aa, 0.5) * vCol.a;
  if (a < 0.01) discard;
  oColor = vec4(mix(vCol.rgb, vFog.rgb, vFog.a), a);
}
)";

// ---------------------------------------------------------------- Env
static Vec3 lerp3(const Vec3& a, const Vec3& b, float t) { return a + (b - a) * t; }
struct SkyKey { float el; int zen, hor, sun; float sunI; int amb; float ambI; };
void Env::update() {
    const double D2R = 3.14159265358979 / 180.0;
    double N = dayOfYear, B = 2 * 3.14159265358979 * (N - 81) / 364.0;
    double eot = 9.87 * sin(2 * B) - 7.53 * cos(B) - 1.5 * sin(B);
    double solar = clockHours + (4.0 * (lon - 135.0) + eot) / 60.0;
    double H = 15.0 * (solar - 12.0) * D2R, decl = 23.44 * D2R * sin(2 * 3.14159265358979 * (284 + N) / 365.0), la = lat * D2R;
    double sinEl = sin(la) * sin(decl) + cos(la) * cos(decl) * cos(H);
    double el = asin(sinEl);
    double azS = atan2(sin(H), cos(H) * sin(la) - tan(decl) * cos(la));      // from south, west positive
    double az = azS + 3.14159265358979;                                         // from north, clockwise
    sunElev = (float)(el / D2R);
    Vec3 sd((float)(sin(az) * cos(el)), (float)sin(el), (float)(-cos(az) * cos(el)));
    static const SkyKey keys[] = {
        {-90, 0x03050a, 0x0a0f1c, 0x8fa8d8, 0.035f, 0x1a2540, 0.22f},
        {-14, 0x03050a, 0x0c1322, 0x8fa8d8, 0.035f, 0x1a2540, 0.22f},
        {-6, 0x0e1a36, 0x5a4f66, 0xff8a50, 0.0f, 0x2a3558, 0.32f},
        {-1.5f, 0x23406f, 0xe58a52, 0xff7a3c, 0.10f, 0x5a6a90, 0.42f},
        {1.5f, 0x2c4f86, 0xf0a868, 0xff9a55, 0.55f, 0x7a8cb0, 0.50f},
        {7, 0x3565a8, 0xe9c79a, 0xffc890, 0.95f, 0x8fa6c8, 0.56f},
        {18, 0x2f6cc0, 0xc4d6e6, 0xfff0dc, 1.12f, 0x9db8dc, 0.60f},
        {90, 0x2a66c2, 0xb9d0e6, 0xfff6ea, 1.18f, 0x9db8dc, 0.62f}};
    int k = 0; while (k < 6 && sunElev > keys[k + 1].el) k++;
    float t = sat((sunElev - keys[k].el) / (keys[k + 1].el - keys[k].el));
    const SkyKey& a = keys[k]; const SkyKey& b = keys[k + 1];
    zenith = lerp3(lin(a.zen), lin(b.zen), t); horizon = lerp3(lin(a.hor), lin(b.hor), t);
    float sunI = lerpf(a.sunI, b.sunI, t);
    sunColor = lerp3(lin(a.sun), lin(b.sun), t) * sunI;
    skyAmb = lerp3(lin(a.amb) * a.ambI, lin(b.amb) * b.ambI, t);
    night = sstep(3.f, -7.f, sunElev);
    starVis = sstep(-5.f, -12.f, sunElev) * (1.f - cloud * 0.6f);
    // overcast dims and greys everything
    float oc = sstep(0.55f, 0.95f, cloud);
    Vec3 grey = Vec3(1, 1, 1) * ((horizon.x + horizon.y + horizon.z) / 3.f);
    zenith = lerp3(zenith, grey * 0.8f, oc * 0.8f); horizon = lerp3(horizon, grey, oc * 0.6f);
    sunColor = sunColor * (1.f - 0.75f * oc); skyAmb = skyAmb * (1.f + 0.25f * oc);
    // below the horizon the "sun" light is moonlight from high up
    sunDir = sunElev > -4.f ? normalize(Vec3(sd.x, std::max(sd.y, 0.03f), sd.z)) : normalize(Vec3(-0.4f, 0.75f, 0.3f));
    groundAmb = skyAmb * 0.42f + sunColor * 0.10f;
    fogColor = lerp3(horizon, zenith, 0.12f);
    fogSun = lerp3(lin(a.sun), lin(b.sun), t) * (0.55f + 0.5f * sunI); fogSunAmt = sunElev > -8.f ? sstep(-8.f, 4.f, sunElev) * sstep(60.f, 8.f, sunElev) * 0.85f + 0.15f : 0.f;
    fogDensity = lerpf(1.0f / 14000.f, 1.0f / 5500.f, sat(cloud * 0.9f + night * 0.3f));
    // cabin: daylight through the windows, a dim blue strip at night, sodium wash inside tunnels
    Vec3 day = skyAmb * 0.95f + sunColor * 0.22f;
    Vec3 lamps = lin(0x4a5a8c) * 0.16f * night;
    cabin = lerp3(day * (1.f - 0.2f * night) + lamps, Vec3(0.34f, 0.28f, 0.2f) + lamps, tunnel);
    // season tints (authoring colours, sRGB)
    struct Season { int grass, forest, crop, decid, ginkgo; };
    static const Season S[12] = {
        {0x8d8660, 0x5f6248, 0x86775a, 0x6f6553, 0x6f6553},   // Jan
        {0x8d8660, 0x5f6248, 0x86775a, 0x6f6553, 0x6f6553},
        {0x8c9058, 0x5f6c48, 0x80765a, 0x7a7758, 0x7f8458},
        {0x7fa052, 0x5d8a48, 0x7c7a58, 0x8fb45c, 0x9cc060},
        {0x6a9a46, 0x4a8240, 0x6f8468, 0x5f9a44, 0x74ac48},
        {0x5f9440, 0x3f7a36, 0x5f9a44, 0x4a8a3a, 0x5c9a3e},
        {0x5a903c, 0x3a7433, 0x5a9c3e, 0x427f36, 0x54923a},
        {0x5c8f3c, 0x3b7333, 0x6aa040, 0x447f36, 0x56923a},
        {0x6d9040, 0x45753a, 0xa8a43e, 0x5a8238, 0x86a03a},
        {0x8a9248, 0x5e743c, 0xc2a23c, 0x9a7a34, 0xcdb236},
        {0x9a9050, 0x6b6a40, 0x9c8a5a, 0xb0692e, 0xd8b22c},   // Nov
        {0x91885c, 0x62644a, 0x8a7a5a, 0x7b6a50, 0x8a7a50}};
    const Season& s = S[(month + 11) % 12];
    tintGrass = lin(s.grass); tintForest = lin(s.forest); tintCrop = lin(s.crop); tintUrban = lin(0x8c8a84); tintRock = lin(0x857f72);
    tintDecid = lin(s.decid) * 2.0f; tintEver = Vec3(1, 1, 1) * 0.95f; tintGinkgo = lin(s.ginkgo) * 2.0f;
}
void Env::fill(FrameUBO& f) const {
    auto set = [](float* d, const Vec3& v, float w) { d[0] = v.x; d[1] = v.y; d[2] = v.z; d[3] = w; };
    set(f.sunDir, sunDir, night); set(f.sunColor, sunColor, 0); set(f.skyAmb, skyAmb, 0); set(f.groundAmb, groundAmb, 0);
    set(f.fogColor, fogColor, fogDensity); set(f.fogSun, fogSun, fogSunAmt); set(f.cabin, cabin, 0);
    set(f.skyZenith, zenith, 0); set(f.skyHorizon, horizon, 0);
    f.misc[0] = cloud; f.misc[1] = starVis; f.misc[2] = 1; f.time[3] = tunnel;
}

// ---------------------------------------------------------------- Renderer
bool Renderer::init() {
    std::string c = kCommon;
    bool ok = true;
    ok &= lit.build("lit", (c + kLitVS).c_str(), (c + kLitFS).c_str());
    ok &= terrNear.build("terrNear", (c + kTerrVS).c_str(), (std::string("#define NEAR 1\n") + c + kTerrFS).c_str());
    ok &= terrFar.build("terrFar", (c + kTerrVS).c_str(), (c + kTerrFS).c_str());
    ok &= road.build("road", (c + kRoadVS).c_str(), (c + kRoadFS).c_str());
    ok &= bill.build("bill", (c + kBillVS).c_str(), (c + kBillFS).c_str());
    ok &= sky.build("sky", (c + kSkyVS).c_str(), (c + kSkyFS).c_str());
    ok &= text.build("text", (c + kTextVS).c_str(), (c + kTextFS).c_str());
    if (!ok) return false;
    texTerrain = loadTextureArray("terrain.png", 4, false);
    texFacade = loadTextureArray("facade.png", 8, true);
    texInterior = loadTextureArray("interior.png", 8, false);
    texAsphalt = loadTexture2D("asphalt.png", false);
    texTrees = loadTexture2D("trees.png", true, true, false);
    texClouds = loadTexture2D("clouds.png", false);
    MeshData m; m.vert(Vec3(-1, -1, 0), Vec3(0, 0, 1)); m.vert(Vec3(3, -1, 0), Vec3(0, 0, 1)); m.vert(Vec3(-1, 3, 0), Vec3(0, 0, 1)); m.tri(0, 1, 2);
    skyTri.upload(m);
    return texTerrain && texFacade && texInterior && texAsphalt && texTrees && texClouds;
}
bool Renderer::visible(const Chunk& c, const Vec3d& cam, const Vec3& fwd, Vec3& rel) const {
    rel = (c.origin - cam).f();
    float dist = length(rel);
    if (dist < c.radius * 1.05f) return true;
    float cosA = dot(rel, fwd) / dist;
    float ang = acosf(clampf(cosA, -1.f, 1.f)), lim = radf(66.f) + asinf(clampf(c.radius / dist, 0.f, 1.f));
    return ang < lim;
}
void Renderer::drawWorldOpaque(World& w, const Env& env, const Vec3d& cam, const Vec3& fwd) {
    stats = DrawStats();
    struct Vis { Chunk* c; Vec3 rel; float d; };
    static std::vector<Vis> vis; vis.clear();
    for (auto& kv : w.chunks) {
        Chunk& c = *kv.second; if (!c.ready) continue;
        Vec3 rel; if (!visible(c, cam, fwd, rel)) continue;
        vis.push_back({&c, rel, length(rel)});
    }
    std::sort(vis.begin(), vis.end(), [](const Vis& a, const Vis& b) { return a.d < b.d; });
    stats.chunks = (int)vis.size();
    auto count = [&](const Mesh& m) { stats.tris += m.count / 3; stats.draws++; };
    glEnable(GL_DEPTH_TEST); glDepthFunc(GL_LEQUAL); glDepthMask(GL_TRUE); glEnable(GL_CULL_FACE); glCullFace(GL_BACK); glDisable(GL_BLEND);
    // road surfaces
    road.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, texAsphalt); road.seti("uAsphalt", 0);
    for (auto& v : vis) if (v.c->road.valid()) { road.setMat4("uModel", Mat4::translate(v.rel)); v.c->road.draw(); count(v.c->road); }
    // lit geometry
    lit.use(); glBindTexture(GL_TEXTURE_2D_ARRAY, texFacade); lit.seti("uTex", 0); lit.set1("uTexGain", 1.f);
    for (auto& v : vis) if (v.c->lit.valid()) { lit.setMat4("uModel", Mat4::translate(v.rel)); v.c->lit.draw(); count(v.c->lit); }
    // terrain
    Vec3 tints[5] = {env.tintGrass, env.tintForest, env.tintCrop, env.tintUrban, env.tintRock};
    for (int pass = 0; pass < 2; pass++) {
        Shader& sh = pass == 0 ? terrNear : terrFar;
        sh.use(); glBindTexture(GL_TEXTURE_2D_ARRAY, texTerrain); sh.seti("uTex", 0);
        glUniform3fv(sh.loc("uTint"), 5, &tints[0].x);
        for (auto& v : vis) {
            if (!v.c->terrain.valid() || (v.c->type == CT_FAR) != (pass == 1)) continue;
            sh.setMat4("uModel", Mat4::translate(v.rel));
            glUniform2f(sh.loc("uTexOrigin"), (float)fmod(v.c->origin.x, 4200.0), (float)fmod(v.c->origin.z, 4200.0));
            v.c->terrain.draw(); count(v.c->terrain);
        }
    }
    // draped roads
    road.use(); glBindTexture(GL_TEXTURE_2D, texAsphalt);
    glEnable(GL_POLYGON_OFFSET_FILL); glPolygonOffset(-2.f, -8.f);
    for (auto& v : vis) if (v.c->decal.valid()) { road.setMat4("uModel", Mat4::translate(v.rel)); v.c->decal.draw(); count(v.c->decal); }
    glDisable(GL_POLYGON_OFFSET_FILL);
}
void Renderer::drawSky() {
    glDepthFunc(GL_LEQUAL); glDepthMask(GL_FALSE); glDisable(GL_CULL_FACE);
    sky.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, texClouds); sky.seti("uClouds", 0);
    skyTri.draw();
    glDepthMask(GL_TRUE); glEnable(GL_CULL_FACE);
}
void Renderer::drawWorldAlpha(World& w, const Env& env, const Vec3d& cam, const Vec3& fwd, Font& font) {
    struct Vis { Chunk* c; Vec3 rel; float d; };
    static std::vector<Vis> vis; vis.clear();
    for (auto& kv : w.chunks) {
        Chunk& c = *kv.second; if (!c.ready) continue;
        if (!c.trees.valid() && !c.glass.valid() && !c.text.valid() && !c.glow.valid()) continue;
        Vec3 rel; if (!visible(c, cam, fwd, rel)) continue;
        vis.push_back({&c, rel, length(rel)});
    }
    std::sort(vis.begin(), vis.end(), [](const Vis& a, const Vis& b) { return a.d < b.d; });
    // foliage: alpha tested, depth written
    glDisable(GL_CULL_FACE); glDisable(GL_BLEND);
    if (a2c) glEnable(GL_SAMPLE_ALPHA_TO_COVERAGE);
    bill.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, texTrees); bill.seti("uTex", 0);
    bill.set4("uParams", 0, a2c ? 1.f : 0.f, 0, 0);
    bill.set3("uTintEver", env.tintEver); bill.set3("uTintDecid", env.tintDecid); bill.set3("uTintGinkgo", env.tintGinkgo);
    for (auto& v : vis) if (v.c->trees.valid()) { bill.setMat4("uModel", Mat4::translate(v.rel)); v.c->trees.draw(); stats.tris += v.c->trees.count / 3; stats.draws++; }
    if (a2c) glDisable(GL_SAMPLE_ALPHA_TO_COVERAGE);
    // blended: far to near
    glEnable(GL_BLEND); glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA); glDepthMask(GL_FALSE);
    lit.use(); glBindTexture(GL_TEXTURE_2D_ARRAY, texFacade); lit.seti("uTex", 0); lit.set1("uTexGain", 1.f);
    for (auto it = vis.rbegin(); it != vis.rend(); ++it) if (it->c->glass.valid()) { lit.setMat4("uModel", Mat4::translate(it->rel)); it->c->glass.draw(); stats.draws++; }
    text.use(); glBindTexture(GL_TEXTURE_2D, font.tex); text.seti("uFont", 0);
    for (auto it = vis.rbegin(); it != vis.rend(); ++it) if (it->c->text.valid()) { text.setMat4("uModel", Mat4::translate(it->rel)); it->c->text.draw(); stats.draws++; }
    if (env.night > 0.02f) {
        glBlendFunc(GL_ONE, GL_ONE);
        bill.use(); bill.set4("uParams", 1, 0, 0, 0);
        for (auto& v : vis) if (v.c->glow.valid()) { bill.setMat4("uModel", Mat4::translate(v.rel)); v.c->glow.draw(); stats.draws++; }
    }
    glDisable(GL_BLEND); glDepthMask(GL_TRUE); glEnable(GL_CULL_FACE);
}
void Renderer::drawLit(const Mesh& m, const Mat4& model, GLuint texArray, float gain) {
    if (!m.valid()) return;
    lit.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D_ARRAY, texArray); lit.seti("uTex", 0); lit.set1("uTexGain", gain);
    lit.setMat4("uModel", model); m.draw(); stats.tris += m.count / 3; stats.draws++;
}
void Renderer::drawText(const Mesh& m, const Mat4& model, Font& font) {
    if (!m.valid()) return;
    text.use(); glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, font.tex); text.seti("uFont", 0);
    text.setMat4("uModel", model); m.draw(); stats.draws++;
}
