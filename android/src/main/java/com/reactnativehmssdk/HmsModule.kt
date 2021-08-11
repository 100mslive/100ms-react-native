package com.reactnativehmssdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import live.hms.video.sdk.HMSSDK

class HmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var hmsSDK:HMSSDK? = null;

    override fun getName(): String {
        return "HmsManager"
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun build() {
       hmsSDK = HMSSDK
        .Builder(reactApplicationContext)
        .build()
      println("***$hmsSDK")
    }
}
