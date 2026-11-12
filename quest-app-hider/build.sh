#!/usr/bin/env bash
# Build quest-app-hider.apk with the Android SDK build-tools directly (no Gradle).
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-/home/user/android-sdk}"
BT="$ANDROID_HOME/build-tools/34.0.0"
PLAT="$ANDROID_HOME/platforms/android-34/android.jar"

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$HERE/app"
OUT="$HERE/build"

rm -rf "$OUT"
mkdir -p "$OUT/compiled" "$OUT/gen" "$OUT/classes" "$OUT/dex"

echo "==> [1/7] compile resources"
"$BT/aapt2" compile --dir "$APP/res" -o "$OUT/compiled/res.zip"

echo "==> [2/7] link resources + manifest"
"$BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$PLAT" \
  --manifest "$APP/AndroidManifest.xml" \
  --java "$OUT/gen" \
  "$OUT/compiled/res.zip"

echo "==> [3/7] compile java"
find "$APP/src" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
javac -source 8 -target 8 -nowarn -classpath "$PLAT" \
  -d "$OUT/classes" @"$OUT/sources.txt" 2>/dev/null

echo "==> [4/7] dex"
mapfile -t CLASSES < <(find "$OUT/classes" -name '*.class')
# build-tools 34's bundled d8 (r8 8.2.2-dev) crashes under JDK 21, so use a
# newer standalone r8.jar if present; fall back to the SDK's d8 otherwise.
R8_JAR="${R8_JAR:-$ANDROID_HOME/r8.jar}"
if [ -f "$R8_JAR" ]; then
  java -cp "$R8_JAR" com.android.tools.r8.D8 \
    --min-api 26 --lib "$PLAT" --output "$OUT/dex" "${CLASSES[@]}"
else
  "$BT/d8" --min-api 26 --lib "$PLAT" --output "$OUT/dex" "${CLASSES[@]}"
fi

echo "==> [5/7] package dex into apk"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
( cd "$OUT/dex" && zip -q "$OUT/unsigned.apk" classes.dex )

echo "==> [6/7] zipalign"
"$BT/zipalign" -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

echo "==> [7/7] sign"
KS="$OUT/debug.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Quest App Hider, O=questhider, C=US" >/dev/null 2>&1
fi
"$BT/apksigner" sign \
  --ks "$KS" --ks-pass pass:android --key-pass pass:android \
  --out "$HERE/quest-app-hider.apk" "$OUT/aligned.apk"

"$BT/apksigner" verify --print-certs "$HERE/quest-app-hider.apk" | head -2
echo ""
echo "DONE -> $HERE/quest-app-hider.apk"
