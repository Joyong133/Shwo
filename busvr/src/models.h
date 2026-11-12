// Vehicle meshes (bus-space convention: +X right, +Y up, -Z forward, origin on the road under the centre).
#pragma once
#include "gfx.h"
enum VehicleType { VEH_SEDAN = 0, VEH_SUV, VEH_VAN, VEH_PORTER, VEH_BOXTRUCK, VEH_TRAILER, VEH_BUS, VEH_COUNT };
struct VehicleInfo { float length, width, height; };
void buildVehicle(int type, MeshData& out, VehicleInfo& info);
// bake a tinted copy into a static mesh (parked cars, set pieces)
void appendVehicle(MeshData& out, int type, const Mat4& M, int tintHex);
