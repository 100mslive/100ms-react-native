package com.hms.reactnativevideoplugin

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ReactNativeVideoPluginModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(
    a: Double,
    b: Double,
    promise: Promise,
  ) {
    promise.resolve(a * b)
  }

  companion object {
    const val NAME = "ReactNativeVideoPlugin"
  }
}
