#!/bin/bash
# Builds the headless desktop harness (software GL) used to check the visuals without a headset.
set -e
cd "$(dirname "$0")"
mkdir -p build/obj
SRCS="gfx world world_data world_terrain world_road world_scene world_signs world_setpieces render app app_ui app_apps app_traffic bus models audio main_desktop $EXTRA_SRCS"
for s in $SRCS; do
  if [ ! -f build/obj/$s.o ] || [ src/$s.cpp -nt build/obj/$s.o ] || [ -n "$(find src -name '*.h' -newer build/obj/$s.o | head -1)" ]; then
    g++ -std=c++17 -O2 -g -Wall -Wno-unused-function -Wno-misleading-indentation -c src/$s.cpp -o build/obj/$s.o &
  fi
done
wait
g++ -o build/busvr_desktop $(for s in $SRCS; do echo build/obj/$s.o; done) -lEGL -lGLESv2 -lz -lpthread
