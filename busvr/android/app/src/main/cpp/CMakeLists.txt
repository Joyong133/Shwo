cmake_minimum_required(VERSION 3.22.1)
project(busvr LANGUAGES C CXX)

set(SRC ${CMAKE_CURRENT_SOURCE_DIR}/../../../../../src)
find_package(OpenXR REQUIRED CONFIG)

add_library(native_app_glue STATIC ${ANDROID_NDK}/sources/android/native_app_glue/android_native_app_glue.c)
target_include_directories(native_app_glue PUBLIC ${ANDROID_NDK}/sources/android/native_app_glue)

file(GLOB APP_SOURCES CONFIGURE_DEPENDS ${SRC}/*.cpp)
list(FILTER APP_SOURCES EXCLUDE REGEX "main_desktop\\.cpp$")
add_library(busvr SHARED ${APP_SOURCES})
target_include_directories(busvr PRIVATE ${SRC})
target_compile_options(busvr PRIVATE -O2 -ffast-math -Wall -Wno-unused-function)
target_link_libraries(busvr PRIVATE native_app_glue OpenXR::openxr_loader android log EGL GLESv3 z aaudio)
# NativeActivity looks this symbol up by name; keep it through the static glue library.
target_link_options(busvr PRIVATE -u ANativeActivity_onCreate)
