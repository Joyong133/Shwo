package com.questhider.app;

import android.app.admin.DeviceAdminReceiver;

/**
 * Device admin receiver. Must be present for the app to be set as Device Owner
 * via: adb shell dpm set-device-owner com.questhider.app/.HiderAdminReceiver
 */
public class HiderAdminReceiver extends DeviceAdminReceiver {
    // No overrides needed. Presence of this receiver + device-owner provisioning
    // is what grants DevicePolicyManager.setApplicationHidden() permission.
}
