// The coach: interior model (2+1 "udeung" layout), seat positions, glass.
#pragma once
#include "gfx.h"

struct SeatPos { float x, z; int number; bool window; const char* label; };

struct BusModel {
    static constexpr float kFloor = 1.30f;        // passenger deck above the road
    static constexpr float kHalfW = 1.17f;        // interior half width
    static constexpr float kFront = -5.95f, kRear = 5.95f;
    static constexpr float kSill = kFloor + 0.80f, kWinTop = kFloor + 1.60f, kCeil = kFloor + 1.95f;
    std::vector<SeatPos> seats;                   // every passenger seat
    std::vector<int> choices;                     // seats the rider may pick (indices into seats)
    Mesh opaque, glass;
    void build();
    // resting eye position for a seat, in bus space
    Vec3 eye(int seatIndex) const;
    // little "someone is sitting there" hints, rebuilt when the rider changes seat
    void buildPassengers(MeshData& out, int riderSeat, uint32_t seed) const;
    // anchors for the dynamic displays (bus space)
    Vec3 monitorCenter() const { return Vec3(0.18f, kFloor + 1.66f, -4.62f); }
    Vec3 ledCenter() const { return Vec3(0.0f, kFloor + 1.80f, -5.60f); }
};
