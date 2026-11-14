# Keep Screen On (Android)

A small Android app that keeps the screen from turning off for as long as you like, in any app,
until you switch it off yourself.

**APK:** [`release/keep-screen-on.apk`](release/keep-screen-on.apk) (Android 8.0+, ~17 KB)

## Install & set up
1. Copy the APK to the phone and open it (allow "Install unknown apps" for your file manager/browser when asked).
2. Open **Keep Screen On** and tap the items under **Setup**:
   - **Display over other apps** (required): this is what makes it work in the background.
   - **Ignore battery optimization** (recommended): stops the system from killing it.
   - **Notifications** (Android 13+): shows the ongoing notification with a **Stop** button.
3. Tap the big **OFF** circle → it turns **ON**. Leave the app; the screen stays on.

## Turning it off
- Tap the circle again in the app, **or**
- Tap **Stop** in the notification, **or**
- Use the **Screen On** Quick Settings tile (add it by editing your Quick Settings panel).

The power button still turns the screen off as normal; after you wake the phone it keeps it on again
until you stop the app.

## How it works
A foreground service adds an invisible 1×1-pixel, non-touchable overlay window with
`FLAG_KEEP_SCREEN_ON`, so the system keeps the display awake whichever app is in front. It also holds a
screen wake lock as a fallback. The service uses `START_STICKY`, so Android restarts it if it kills the process.

## Build
```
echo "sdk.dir=/path/to/android-sdk" > local.properties
gradle assembleRelease   # Gradle 8.14, JDK 17+
```
The signing keystore in `app/` uses the password `keepscreenon`. Keep it, so future builds install as updates.
