#include "gfx.h"
#include <zlib.h>
#define STB_IMAGE_IMPLEMENTATION
#define STBI_ONLY_PNG
#define STBI_NO_STDIO
#include "third_party/stb_image.h"

#ifndef GL_TEXTURE_MAX_ANISOTROPY_EXT
#define GL_TEXTURE_MAX_ANISOTROPY_EXT 0x84FE
#endif

typedef void (*PFN_FBTexMV)(GLenum, GLenum, GLuint, GLint, GLint, GLsizei);
typedef void (*PFN_FBTexMSMV)(GLenum, GLenum, GLuint, GLint, GLsizei, GLint, GLsizei);
static PFN_FBTexMV pFramebufferTextureMultiviewOVR = nullptr;
static PFN_FBTexMSMV pFramebufferTextureMultisampleMultiviewOVR = nullptr;

bool readAssetZ(const char* name, std::vector<uint8_t>& out) {
    std::vector<uint8_t> z;
    if (!platformReadAsset((std::string(name) + ".z").c_str(), z) || z.size() < 4) { LOGE("asset missing: %s", name); return false; }
    uint32_t raw; memcpy(&raw, z.data(), 4);
    out.resize(raw);
    uLongf len = raw;
    int rc = uncompress(out.data(), &len, z.data() + 4, (uLong)(z.size() - 4));
    if (rc != Z_OK || len != raw) { LOGE("asset corrupt: %s (%d)", name, rc); return false; }
    return true;
}

// ---------------------------------------------------------------- MeshData
static inline int8_t pk(float v) { return (int8_t)lroundf(clampf(v, -1.f, 1.f) * 127.f); }
uint32_t MeshData::vert(const Vec3& p, const Vec3& n, float u, float vv) {
    Vtx t; t.px = p.x; t.py = p.y; t.pz = p.z; t.nx = pk(n.x); t.ny = pk(n.y); t.nz = pk(n.z); t.mat = mat;
    t.r = cr; t.g = cg; t.b = cb; t.a = ca; t.u = u; t.v = vv; t.w = layer;
    v.push_back(t); return (uint32_t)v.size() - 1;
}
void MeshData::quadN(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d, const Vec3& n, float u0, float v0, float u1, float v1) {
    uint32_t i0 = vert(a, n, u0, v0); vert(b, n, u1, v0); vert(c, n, u1, v1); vert(d, n, u0, v1);
    tri(i0, i0 + 1, i0 + 2); tri(i0, i0 + 2, i0 + 3);
}
void MeshData::quad(const Vec3& a, const Vec3& b, const Vec3& c, const Vec3& d, float u0, float v0, float u1, float v1) {
    quadN(a, b, c, d, normalize(cross(b - a, d - a)), u0, v0, u1, v1);
}
void MeshData::box(const Mat4& M, const Vec3& lo, const Vec3& hi, int faces, float s) {
    auto P = [&](float x, float y, float z) { return M.point(Vec3(x, y, z)); };
    float dx = (hi.x - lo.x) * s, dy = (hi.y - lo.y) * s, dz = (hi.z - lo.z) * s;
    if (faces & 1) quadN(P(hi.x, lo.y, hi.z), P(hi.x, lo.y, lo.z), P(hi.x, hi.y, lo.z), P(hi.x, hi.y, hi.z), M.dir(Vec3(1, 0, 0)), 0, 0, dz, dy);
    if (faces & 2) quadN(P(lo.x, lo.y, lo.z), P(lo.x, lo.y, hi.z), P(lo.x, hi.y, hi.z), P(lo.x, hi.y, lo.z), M.dir(Vec3(-1, 0, 0)), 0, 0, dz, dy);
    if (faces & 4) quadN(P(lo.x, hi.y, hi.z), P(hi.x, hi.y, hi.z), P(hi.x, hi.y, lo.z), P(lo.x, hi.y, lo.z), M.dir(Vec3(0, 1, 0)), 0, 0, dx, dz);
    if (faces & 8) quadN(P(lo.x, lo.y, lo.z), P(hi.x, lo.y, lo.z), P(hi.x, lo.y, hi.z), P(lo.x, lo.y, hi.z), M.dir(Vec3(0, -1, 0)), 0, 0, dx, dz);
    if (faces & 16) quadN(P(lo.x, lo.y, hi.z), P(hi.x, lo.y, hi.z), P(hi.x, hi.y, hi.z), P(lo.x, hi.y, hi.z), M.dir(Vec3(0, 0, 1)), 0, 0, dx, dy);
    if (faces & 32) quadN(P(hi.x, lo.y, lo.z), P(lo.x, lo.y, lo.z), P(lo.x, hi.y, lo.z), P(hi.x, hi.y, lo.z), M.dir(Vec3(0, 0, -1)), 0, 0, dx, dy);
}
// Box with every edge and corner rounded (radius r). Smooth normals.
void MeshData::roundBox(const Mat4& M, const Vec3& lo, const Vec3& hi, float r, int seg, float s) {
    Vec3 size = hi - lo;
    r = std::min(r, 0.499f * std::min(size.x, std::min(size.y, size.z)));
    std::vector<float> br[3];
    const float lov[3] = {lo.x, lo.y, lo.z}, hiv[3] = {hi.x, hi.y, hi.z};
    for (int a = 0; a < 3; a++) {
        for (int k = 0; k <= seg; k++) br[a].push_back(lov[a] + r * (1.f - cosf((float)k / seg * PI * 0.5f)));
        for (int k = seg; k >= 0; k--) br[a].push_back(hiv[a] - r * (1.f - cosf((float)k / seg * PI * 0.5f)));
    }
    Vec3 ilo = lo + Vec3(r, r, r), ihi = hi - Vec3(r, r, r);
    for (int face = 0; face < 6; face++) {
        int ax = face / 2; bool pos = (face & 1) == 0;
        int ua = (ax + 1) % 3, va = (ax + 2) % 3;
        int nu = (int)br[ua].size(), nv = (int)br[va].size();
        uint32_t base = (uint32_t)v.size();
        for (int j = 0; j < nv; j++) for (int i2 = 0; i2 < nu; i2++) {
            float c[3]; c[ax] = pos ? hiv[ax] : lov[ax]; c[ua] = br[ua][i2]; c[va] = br[va][j];
            Vec3 p(c[0], c[1], c[2]);
            Vec3 in(clampf(p.x, ilo.x, ihi.x), clampf(p.y, ilo.y, ihi.y), clampf(p.z, ilo.z, ihi.z));
            Vec3 d = normalize(p - in);
            Vec3 q = in + d * r;
            vert(M.point(q), M.dir(d), c[ua] * s, c[va] * s);
        }
        for (int j = 0; j + 1 < nv; j++) for (int i2 = 0; i2 + 1 < nu; i2++) {
            uint32_t a = base + j * nu + i2, b = a + 1, c2 = a + nu + 1, d2 = a + nu;
            if (pos) { tri(a, b, c2); tri(a, c2, d2); } else { tri(a, c2, b); tri(a, d2, c2); }
        }
    }
}
void MeshData::cylinder(const Mat4& M, const Vec3& a, const Vec3& b, float ra, float rb, int seg, bool caps) {
    Vec3 ax = normalize(b - a);
    Vec3 t = fabsf(ax.y) < 0.9f ? Vec3(0, 1, 0) : Vec3(1, 0, 0);
    Vec3 u = normalize(cross(t, ax)), w = cross(ax, u);
    uint32_t base = (uint32_t)v.size();
    float len = length(b - a);
    for (int k = 0; k <= seg; k++) {
        float an = (float)k / seg * 2 * PI; Vec3 d = u * cosf(an) + w * sinf(an);
        Vec3 n = normalize(d + ax * ((ra - rb) / std::max(len, 1e-4f)));
        vert(M.point(a + d * ra), M.dir(n), (float)k / seg, 0);
        vert(M.point(b + d * rb), M.dir(n), (float)k / seg, len);
    }
    for (int k = 0; k < seg; k++) { uint32_t i0 = base + k * 2; tri(i0, i0 + 2, i0 + 3); tri(i0, i0 + 3, i0 + 1); }
    if (caps) {
        for (int e = 0; e < 2; e++) {
            Vec3 c = e ? b : a; float rr = e ? rb : ra; Vec3 n = e ? ax : -ax;
            if (rr < 1e-4f) continue;
            uint32_t cb2 = vert(M.point(c), M.dir(n), 0.5f, 0.5f);
            for (int k = 0; k <= seg; k++) { float an = (float)k / seg * 2 * PI; Vec3 d = u * cosf(an) + w * sinf(an); vert(M.point(c + d * rr), M.dir(n), 0.5f + 0.5f * cosf(an), 0.5f + 0.5f * sinf(an)); }
            for (int k = 0; k < seg; k++) { if (e) tri(cb2, cb2 + 1 + k, cb2 + 2 + k); else tri(cb2, cb2 + 2 + k, cb2 + 1 + k); }
        }
    }
}
void MeshData::append(const MeshData& o, const Mat4& M) {
    uint32_t base = (uint32_t)v.size();
    for (const Vtx& s : o.v) {
        Vtx t = s; Vec3 p = M.point(Vec3(s.px, s.py, s.pz)); Vec3 n = M.dir(Vec3(s.nx / 127.f, s.ny / 127.f, s.nz / 127.f));
        t.px = p.x; t.py = p.y; t.pz = p.z; t.nx = pk(n.x); t.ny = pk(n.y); t.nz = pk(n.z); v.push_back(t);
    }
    for (uint32_t k : o.i) i.push_back(base + k);
}

// ---------------------------------------------------------------- Mesh
void Mesh::upload(const void* verts, size_t vbytes, const uint32_t* idx, size_t icount, Layout l, bool dynamic) {
    if (!vao) { glGenVertexArrays(1, &vao); glGenBuffers(1, &vbo); glGenBuffers(1, &ibo); }
    layout = l; count = (int)icount;
    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, (GLsizeiptr)vbytes, verts, dynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, (GLsizeiptr)(icount * 4), idx, dynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW);
    if (l == LAYOUT_VTX) {
        glEnableVertexAttribArray(0); glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vtx), (void*)0);
        glEnableVertexAttribArray(1); glVertexAttribPointer(1, 3, GL_BYTE, GL_TRUE, sizeof(Vtx), (void*)12);
        glEnableVertexAttribArray(4); glVertexAttribPointer(4, 1, GL_UNSIGNED_BYTE, GL_FALSE, sizeof(Vtx), (void*)15);
        glEnableVertexAttribArray(2); glVertexAttribPointer(2, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(Vtx), (void*)16);
        glEnableVertexAttribArray(3); glVertexAttribPointer(3, 3, GL_FLOAT, GL_FALSE, sizeof(Vtx), (void*)20);
    } else if (l == LAYOUT_TVTX) {
        glEnableVertexAttribArray(0); glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(TVtx), (void*)0);
        glEnableVertexAttribArray(1); glVertexAttribPointer(1, 3, GL_BYTE, GL_TRUE, sizeof(TVtx), (void*)12);
        glEnableVertexAttribArray(2); glVertexAttribPointer(2, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(TVtx), (void*)16);
        glEnableVertexAttribArray(3); glVertexAttribPointer(3, 2, GL_FLOAT, GL_FALSE, sizeof(TVtx), (void*)20);
    } else {
        glEnableVertexAttribArray(0); glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(BVtx), (void*)0);
        glEnableVertexAttribArray(1); glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(BVtx), (void*)12);
        glEnableVertexAttribArray(3); glVertexAttribPointer(3, 2, GL_FLOAT, GL_FALSE, sizeof(BVtx), (void*)20);
        glEnableVertexAttribArray(2); glVertexAttribPointer(2, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(BVtx), (void*)28);
    }
    glBindVertexArray(0);
}
void Mesh::draw() const {
    if (!vao || count <= 0) return;
    glBindVertexArray(vao);
    glDrawElements(GL_TRIANGLES, count, GL_UNSIGNED_INT, nullptr);
}
void Mesh::destroy() {
    if (vao) { glDeleteVertexArrays(1, &vao); glDeleteBuffers(1, &vbo); glDeleteBuffers(1, &ibo); }
    vao = vbo = ibo = 0; count = 0;
}

// ---------------------------------------------------------------- Shader
static const char* kFrameBlock =
    "layout(std140) uniform Frame {\n"
    " mat4 uViewProj[2]; vec4 uEyePos[2]; vec4 uSunDir; vec4 uSunColor; vec4 uSkyAmb; vec4 uGroundAmb; vec4 uFogColor; vec4 uFogSun;\n"
    " vec4 uCabin; vec4 uBusPos; vec4 uBusFwd; vec4 uTime; vec4 uSkyZenith; vec4 uSkyHorizon; vec4 uMisc; mat4 uInvViewProj[2];\n"
    "};\n";
static GLuint compile(GLenum type, const std::string& src, const char* name) {
    GLuint s = glCreateShader(type); const char* p = src.c_str();
    glShaderSource(s, 1, &p, nullptr); glCompileShader(s);
    GLint ok = 0; glGetShaderiv(s, GL_COMPILE_STATUS, &ok);
    if (!ok) { char log[4096]; glGetShaderInfoLog(s, sizeof(log), nullptr, log); LOGE("shader %s (%s) failed:\n%s", name, type == GL_VERTEX_SHADER ? "vs" : "fs", log); }
    return s;
}
bool Shader::build(const char* name, const char* vs, const char* fs) {
    bool mv = Gfx::get().multiview;
    std::string hv = "#version 300 es\n";
    if (mv) hv += "#extension GL_OVR_multiview2 : require\nlayout(num_views=2) in;\n#define VIEW gl_ViewID_OVR\n";
    std::string common = std::string("precision highp float;\nprecision highp int;\nprecision mediump sampler2DArray;\n") + kFrameBlock;
    if (!mv) common += "#define VIEW uint(uMisc.w)\n";
    std::string hf = "#version 300 es\n";
    GLuint v = compile(GL_VERTEX_SHADER, hv + common + vs, name);
    GLuint f = compile(GL_FRAGMENT_SHADER, hf + common + fs, name);
    prog = glCreateProgram(); glAttachShader(prog, v); glAttachShader(prog, f);
    glBindAttribLocation(prog, 0, "aPos"); glBindAttribLocation(prog, 1, "aNrm"); glBindAttribLocation(prog, 1, "aOff"); glBindAttribLocation(prog, 2, "aCol");
    glBindAttribLocation(prog, 3, "aUv"); glBindAttribLocation(prog, 4, "aMat");
    glLinkProgram(prog);
    GLint ok = 0; glGetProgramiv(prog, GL_LINK_STATUS, &ok);
    glDeleteShader(v); glDeleteShader(f);
    if (!ok) { char log[4096]; glGetProgramInfoLog(prog, sizeof(log), nullptr, log); LOGE("link %s failed:\n%s", name, log); return false; }
    GLuint bi = glGetUniformBlockIndex(prog, "Frame");
    if (bi != GL_INVALID_INDEX) glUniformBlockBinding(prog, bi, 0);
    return true;
}
GLint Shader::loc(const char* n) {
    auto it = locs.find(n);
    if (it != locs.end()) return it->second;
    GLint l = glGetUniformLocation(prog, n); locs[n] = l; return l;
}

// ---------------------------------------------------------------- Gfx
Gfx& Gfx::get() { static Gfx g; return g; }
void Gfx::init() {
    GLint n = 0; glGetIntegerv(GL_NUM_EXTENSIONS, &n);
    bool mv2 = false, msmv = false;
    for (int i = 0; i < n; i++) {
        const char* e = (const char*)glGetStringi(GL_EXTENSIONS, i);
        if (!e) continue;
        if (!strcmp(e, "GL_OVR_multiview2")) mv2 = true;
        if (!strcmp(e, "GL_OVR_multiview_multisampled_render_to_texture")) msmv = true;
        if (!strcmp(e, "GL_EXT_multisampled_render_to_texture")) msaaRTT = true;
        if (!strcmp(e, "GL_EXT_texture_filter_anisotropic")) aniso = true;
    }
    pFramebufferTextureMultiviewOVR = (PFN_FBTexMV)platformGLProc("glFramebufferTextureMultiviewOVR");
    pFramebufferTextureMultisampleMultiviewOVR = (PFN_FBTexMSMV)platformGLProc("glFramebufferTextureMultisampleMultiviewOVR");
    multiview = mv2 && pFramebufferTextureMultiviewOVR;
    msaaMultiview = multiview && msmv && pFramebufferTextureMultisampleMultiviewOVR;
    LOGI("GL: %s | %s | multiview=%d msaaMultiview=%d aniso=%d", (const char*)glGetString(GL_RENDERER), (const char*)glGetString(GL_VERSION), multiview, msaaMultiview, aniso);
    glGenBuffers(1, &ubo);
    glBindBuffer(GL_UNIFORM_BUFFER, ubo);
    glBufferData(GL_UNIFORM_BUFFER, sizeof(FrameUBO), nullptr, GL_DYNAMIC_DRAW);
    glBindBufferBase(GL_UNIFORM_BUFFER, 0, ubo);
}
void Gfx::updateFrame(const FrameUBO& f) {
    glBindBuffer(GL_UNIFORM_BUFFER, ubo);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(FrameUBO), &f);
}

// ---------------------------------------------------------------- StereoTarget
void StereoTarget::init(int w_, int h_, int samples_) {
    w = w_; h = h_; samples = samples_;
    Gfx& g = Gfx::get();
    multiview = g.multiview;
    if (multiview) {
        if (samples > 1 && !g.msaaMultiview) samples = 1;
        glGenTextures(1, &depthTex);
        glBindTexture(GL_TEXTURE_2D_ARRAY, depthTex);
        glTexStorage3D(GL_TEXTURE_2D_ARRAY, 1, GL_DEPTH_COMPONENT24, w, h, 2);
        glBindTexture(GL_TEXTURE_2D_ARRAY, 0);
    } else {
        samples = 1;
        glGenRenderbuffers(2, depthEye);
        for (int e = 0; e < 2; e++) { glBindRenderbuffer(GL_RENDERBUFFER, depthEye[e]); glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, w, h); }
        glBindRenderbuffer(GL_RENDERBUFFER, 0);
    }
    LOGI("StereoTarget %dx%d samples=%d multiview=%d", w, h, samples, multiview);
}
void StereoTarget::bind(GLuint color, int pass) {
    GLuint fbo = 0;
    if (multiview) {
        auto it = fboMV.find(color);
        if (it == fboMV.end()) {
            glGenFramebuffers(1, &fbo);
            glBindFramebuffer(GL_DRAW_FRAMEBUFFER, fbo);
            if (samples > 1) {
                pFramebufferTextureMultisampleMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTex, 0, samples, 0, 2);
                pFramebufferTextureMultisampleMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, color, 0, samples, 0, 2);
            } else {
                pFramebufferTextureMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTex, 0, 0, 2);
                pFramebufferTextureMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, color, 0, 0, 2);
            }
            GLenum st = glCheckFramebufferStatus(GL_DRAW_FRAMEBUFFER);
            if (st != GL_FRAMEBUFFER_COMPLETE) {
                LOGE("multiview framebuffer incomplete: 0x%x (samples=%d)", st, samples);
                if (samples > 1) {   // retry without MSAA
                    samples = 1;
                    pFramebufferTextureMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTex, 0, 0, 2);
                    pFramebufferTextureMultiviewOVR(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, color, 0, 0, 2);
                    st = glCheckFramebufferStatus(GL_DRAW_FRAMEBUFFER);
                    LOGI("multiview framebuffer without MSAA: 0x%x", st);
                }
            }
            fboMV[color] = fbo;
        } else fbo = it->second;
    } else {
        auto it = fboEye.find(color);
        if (it == fboEye.end()) {
            GLuint f[2]; glGenFramebuffers(2, f);
            for (int e = 0; e < 2; e++) {
                glBindFramebuffer(GL_DRAW_FRAMEBUFFER, f[e]);
                glFramebufferTextureLayer(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, color, 0, e);
                glFramebufferRenderbuffer(GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthEye[e]);
                GLenum st = glCheckFramebufferStatus(GL_DRAW_FRAMEBUFFER);
                if (st != GL_FRAMEBUFFER_COMPLETE) LOGE("eye framebuffer incomplete: 0x%x", st);
            }
            fboEye[color] = {f[0], f[1]};
            it = fboEye.find(color);
        }
        fbo = pass == 0 ? it->second.first : it->second.second;
    }
    glBindFramebuffer(GL_DRAW_FRAMEBUFFER, fbo);
    glViewport(0, 0, w, h);
    glScissor(0, 0, w, h);
}
void StereoTarget::resolve(GLuint, int) {
    const GLenum att[1] = {GL_DEPTH_ATTACHMENT};
    glInvalidateFramebuffer(GL_DRAW_FRAMEBUFFER, 1, att);
    glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
}

// ---------------------------------------------------------------- textures
static void texParams(GLenum target, bool mips, bool repeat) {
    glTexParameteri(target, GL_TEXTURE_MIN_FILTER, mips ? GL_LINEAR_MIPMAP_LINEAR : GL_LINEAR);
    glTexParameteri(target, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(target, GL_TEXTURE_WRAP_S, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
    glTexParameteri(target, GL_TEXTURE_WRAP_T, repeat ? GL_REPEAT : GL_CLAMP_TO_EDGE);
    if (mips && Gfx::get().aniso) glTexParameterf(target, GL_TEXTURE_MAX_ANISOTROPY_EXT, 4.f);
}
GLuint makeTexture2D(int w, int h, GLenum internal, GLenum fmt, GLenum type, const void* px, bool mips, bool repeat) {
    GLuint t; glGenTextures(1, &t); glBindTexture(GL_TEXTURE_2D, t);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexImage2D(GL_TEXTURE_2D, 0, (GLint)internal, w, h, 0, fmt, type, px);
    if (mips) glGenerateMipmap(GL_TEXTURE_2D);
    texParams(GL_TEXTURE_2D, mips, repeat);
    return t;
}
GLuint loadTexture2D(const char* asset, bool srgb, bool mips, bool repeat) {
    std::vector<uint8_t> png;
    if (!platformReadAsset(asset, png)) { LOGE("texture missing: %s", asset); return 0; }
    int w, h, c; uint8_t* px = stbi_load_from_memory(png.data(), (int)png.size(), &w, &h, &c, 4);
    if (!px) { LOGE("texture decode failed: %s", asset); return 0; }
    GLuint t = makeTexture2D(w, h, srgb ? GL_SRGB8_ALPHA8 : GL_RGBA8, GL_RGBA, GL_UNSIGNED_BYTE, px, mips, repeat);
    stbi_image_free(px); return t;
}
GLuint loadTextureArray(const char* asset, int layers, bool srgb) {
    std::vector<uint8_t> png;
    if (!platformReadAsset(asset, png)) { LOGE("texture missing: %s", asset); return 0; }
    int w, h, c; uint8_t* px = stbi_load_from_memory(png.data(), (int)png.size(), &w, &h, &c, 4);
    if (!px) { LOGE("texture decode failed: %s", asset); return 0; }
    int lh = h / layers; int levels = 1; for (int s = std::max(w, lh); s > 1; s >>= 1) levels++;
    GLuint t; glGenTextures(1, &t); glBindTexture(GL_TEXTURE_2D_ARRAY, t);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexStorage3D(GL_TEXTURE_2D_ARRAY, levels, srgb ? GL_SRGB8_ALPHA8 : GL_RGBA8, w, lh, layers);
    for (int l = 0; l < layers; l++) glTexSubImage3D(GL_TEXTURE_2D_ARRAY, 0, 0, 0, l, w, lh, 1, GL_RGBA, GL_UNSIGNED_BYTE, px + (size_t)l * lh * w * 4);
    glGenerateMipmap(GL_TEXTURE_2D_ARRAY);
    texParams(GL_TEXTURE_2D_ARRAY, true, true);
    stbi_image_free(px); return t;
}

// ---------------------------------------------------------------- text
uint32_t utf8Next(const char*& p) {
    const unsigned char* s = (const unsigned char*)p; uint32_t c = *s;
    if (c == 0) return 0;
    if (c < 0x80) { p += 1; return c; }
    if ((c >> 5) == 6 && s[1]) { p += 2; return ((c & 31) << 6) | (s[1] & 63); }
    if ((c >> 4) == 14 && s[1] && s[2]) { p += 3; return ((c & 15) << 12) | ((s[1] & 63) << 6) | (s[2] & 63); }
    if ((c >> 3) == 30 && s[1] && s[2] && s[3]) { p += 4; return ((c & 7) << 18) | ((s[1] & 63) << 12) | ((s[2] & 63) << 6) | (s[3] & 63); }
    p += 1; return '?';
}
bool Font::load(const char* asset) {
    std::vector<uint8_t> d;
    if (!readAssetZ(asset, d) || d.size() < 24) return false;
    const uint8_t* p = d.data(); uint32_t magic, count; uint16_t w, h; float fpx, asc, lh;
    memcpy(&magic, p, 4); memcpy(&count, p + 4, 4); memcpy(&w, p + 8, 2); memcpy(&h, p + 10, 2); memcpy(&fpx, p + 12, 4); memcpy(&asc, p + 16, 4); memcpy(&lh, p + 20, 4);
    p += 24; tw = w; th = h; px = fpx; ascent = asc; lineH = lh;
    for (uint32_t i = 0; i < count; i++) {
        uint32_t cp; Glyph g; memcpy(&cp, p, 4); memcpy(&g.x, p + 4, 2); memcpy(&g.y, p + 6, 2); memcpy(&g.w, p + 8, 2); memcpy(&g.h, p + 10, 2);
        memcpy(&g.xo, p + 12, 2); memcpy(&g.yo, p + 14, 2); memcpy(&g.adv, p + 16, 2); p += 20; glyphs[cp] = g;
    }
    tex = makeTexture2D(tw, th, GL_R8, GL_RED, GL_UNSIGNED_BYTE, p, true, false);
    LOGI("font: %u glyphs, atlas %dx%d", count, tw, th);
    return true;
}
float Font::width(const char* s, float size) const {
    float k = size / px, w = 0; const char* p = s;
    while (uint32_t c = utf8Next(p)) { auto it = glyphs.find(c); if (it == glyphs.end()) it = glyphs.find('?'); if (it != glyphs.end()) w += it->second.adv * k; }
    return w;
}
void Font::draw(MeshData& out, const char* s, const Vec3& origin, const Vec3& right, const Vec3& up, float size, int align) const {
    float k = size / px; Vec3 pen = origin;
    if (align) pen = pen - right * (width(s, size) * (align == 1 ? 0.5f : 1.f));
    Vec3 n = normalize(cross(right, up)); const char* p = s;
    while (uint32_t c = utf8Next(p)) {
        auto it = glyphs.find(c); if (it == glyphs.end()) it = glyphs.find('?');
        if (it == glyphs.end()) continue;
        const Glyph& g = it->second;
        if (g.w > 0 && g.h > 0) {
            Vec3 tl = pen + right * (g.xo * k) + up * (g.yo * k);
            Vec3 bl = tl - up * (g.h * k), br = bl + right * (g.w * k), tr = tl + right * (g.w * k);
            float u0 = (float)g.x / tw, v0 = (float)g.y / th, u1 = (float)(g.x + g.w) / tw, v1 = (float)(g.y + g.h) / th;
            uint32_t i0 = out.vert(bl, n, u0, v1); out.vert(br, n, u1, v1); out.vert(tr, n, u1, v0); out.vert(tl, n, u0, v0);
            out.tri(i0, i0 + 1, i0 + 2); out.tri(i0, i0 + 2, i0 + 3);
        }
        pen = pen + right * (g.adv * k);
    }
}
