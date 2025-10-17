package com.luma.dating.screenprotection;

import android.app.Activity;
import android.view.WindowManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

/**
 * Screen Protection Android Native Module
 * 
 * This module provides screen protection functionality for Android devices.
 * It uses FLAG_SECURE to prevent screenshots, screen recording, and screen mirroring.
 * 
 * Key Features:
 * - Blocks all screenshot attempts (system and third-party apps)
 * - Prevents screen recording
 * - Blocks screen mirroring/casting
 * - Works at the OS level for maximum security
 */
public class ScreenProtectionAndroidModule extends ReactContextBaseJavaModule {
    
    private static final String MODULE_NAME = "ScreenProtectionAndroid";
    private boolean isEnabled = false;
    
    public ScreenProtectionAndroidModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    /**
     * Enable screen protection by setting FLAG_SECURE
     * This prevents screenshots, screen recording, and screen mirroring
     */
    @ReactMethod
    public void enable(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                // Set FLAG_SECURE to prevent screenshots and screen recording
                currentActivity.getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                
                isEnabled = true;
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "Screen protection enabled");
                result.putString("platform", "android");
                
                promise.resolve(result);
            } else {
                promise.reject("NO_ACTIVITY", "No current activity available");
            }
        } catch (Exception e) {
            promise.reject("ENABLE_ERROR", "Failed to enable screen protection: " + e.getMessage());
        }
    }
    
    /**
     * Disable screen protection by clearing FLAG_SECURE
     * This allows normal screenshot and screen recording functionality
     */
    @ReactMethod
    public void disable(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                // Clear FLAG_SECURE to allow screenshots and screen recording
                currentActivity.getWindow().clearFlags(
                    WindowManager.LayoutParams.FLAG_SECURE
                );
                
                isEnabled = false;
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "Screen protection disabled");
                result.putString("platform", "android");
                
                promise.resolve(result);
            } else {
                promise.reject("NO_ACTIVITY", "No current activity available");
            }
        } catch (Exception e) {
            promise.reject("DISABLE_ERROR", "Failed to disable screen protection: " + e.getMessage());
        }
    }
    
    /**
     * Check if screen protection is currently enabled
     */
    @ReactMethod
    public void isEnabled(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            result.putBoolean("enabled", isEnabled);
            result.putString("platform", "android");
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", "Failed to get screen protection status: " + e.getMessage());
        }
    }
}
