package com.hms.reactnativevideoplugin

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.reactnativehmssdk.HMSManager
import com.reactnativehmssdk.HMSRNSDK
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.virtualbackground.HMSBlurFilter
import live.hms.video.virtualbackground.HMSVirtualBackground

class ReactNativeVideoPluginModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private var virtualBackground: HMSVirtualBackground? = null
  private var blurFilter: HMSBlurFilter? = null

  override fun getName(): String {
    return NAME
  }

  private fun getHmsRNSdk(data: ReadableMap): HMSRNSDK? {
    val id = data.getString("id")

    return if (id != null) {
      HMSManager.hmsCollection[id]
    } else {
      null
    }
  }

  @ReactMethod
  fun instantiateVideoPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsRnSDK = getHmsRNSdk(data)
    if (hmsRnSDK == null) {
      promise?.reject(
        "6004",
        "HMS RNSdk not initialized",
      )
      return
    }
    val videoPluginConfig = data.getMap("videoPlugin")
    if (videoPluginConfig == null) {
      promise?.reject(
        "6004",
        "`videoPlugin` object was not passed!",
      )
      return
    }
    val backgroundType = videoPluginConfig.getString("background")
    if (backgroundType == null) {
      promise?.reject(
        "6004",
        "You did not pass instance of HMSVirtualBackground class: `background` property is missing!",
      )
      return
    }
    val hmsSDK = hmsRnSDK.hmsSDK
    if (hmsSDK == null) {
      promise?.reject(
        "6004",
        "HMSSDK not initialized",
      )
      return
    }
    if (backgroundType == "blur") {
      blurFilter = HMSBlurFilter(hmsSDK)
      promise?.resolve(true)
    } else {
      promise?.reject(
        "6004",
        "Unknown background passed!",
      )
    }
//    HMSVirtualBackground(hmsRnSDK.hmsSDK, )
  }

  @ReactMethod
  fun enableVideoPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsRnSDK = getHmsRNSdk(data)
    if (hmsRnSDK == null) {
      promise?.reject(
        "6004",
        "HMS RNSdk not initialized",
      )
      return
    }
    val hmsSDK = hmsRnSDK.hmsSDK
    if (hmsSDK == null) {
      promise?.reject(
        "6004",
        "HMSSDK not initialized",
      )
      return
    }
    blurFilter?.let {
      hmsSDK.addPlugin(
        it,
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            promise?.reject(error.code.toString(), error.message)
          }

          override fun onSuccess() {
            promise?.resolve(true)
          }
        },
      )
    }
  }

  @ReactMethod
  fun disableVideoPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsRnSDK = getHmsRNSdk(data)
    if (hmsRnSDK == null) {
      promise?.reject(
        "6004",
        "HMS RNSdk not initialized",
      )
      return
    }
    val hmsSDK = hmsRnSDK.hmsSDK
    if (hmsSDK == null) {
      promise?.reject(
        "6004",
        "HMSSDK not initialized",
      )
      return
    }
    blurFilter?.let {
      hmsSDK.removePlugin(
        it,
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            promise?.reject(error.code.toString(), error.message)
          }

          override fun onSuccess() {
            promise?.resolve(true)
          }
        },
      )
    }
  }

  companion object {
    const val NAME = "ReactNativeVideoPlugin"
  }
}
