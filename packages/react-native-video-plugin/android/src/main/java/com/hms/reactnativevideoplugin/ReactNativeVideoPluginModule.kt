package com.hms.reactnativevideoplugin

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.reactnativehmssdk.HMSManager
import com.reactnativehmssdk.HMSRNSDK
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.virtualbackground.HMSVirtualBackground
import java.net.URL

class ReactNativeVideoPluginModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private var virtualBackgroundPlugin: HMSVirtualBackground? = null

  @ReactMethod
  fun changeVirtualBackground(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsRnSDK = getHmsRNSdk(data)
    if (hmsRnSDK == null) {
      promise?.reject("6004", "HMSRNSDK not initialized")
      return
    }
    val hmsSDK = hmsRnSDK.hmsSDK
    if (hmsSDK == null) {
      promise?.reject("6004", "HMSSDK not initialized")
      return
    }
    val virtualBackgroundPlugin = virtualBackgroundPlugin
    if (virtualBackgroundPlugin == null) {
      promise?.reject(
        "6004",
        "`virtualBackgroundPlugin` is `nil`, Make sure you are passing `HMSVirtualBackground` instance to `videoTrackSettings` in `HMSSDK.build`",
      )
      return
    }
    val backgroundMap = data.getMap("background")
    if (backgroundMap == null) {
      promise?.reject("6004", "`background` object not passed")
      return
    }
    val backgroundType = backgroundMap.getString("type")
    if (backgroundType == null) {
      promise?.reject("6004", "`type` property in `background` object not passed")
      return
    }
    when (backgroundType) {
      "blur" -> {
        val blurRadius = backgroundMap.getDouble("blurRadius")
        virtualBackgroundPlugin.enableBlur(blurRadius.toInt())
        promise?.resolve(true)
      }
      "image" -> {
        val backgroundSource = backgroundMap.getMap("source")
        if (backgroundSource == null) {
          promise?.reject("6004", "`source` property in background object not passed")
          return
        }
        val bgImageUri = backgroundSource.getString("uri")
        if (bgImageUri == null) {
          promise?.reject("6004", "`source.uri` property in background object not passed")
          return
        }
        try {
          val bitmap: Bitmap? =
            if (bgImageUri.startsWith("http://")) {
              val url = URL(bgImageUri)
              BitmapFactory.decodeStream(url.openConnection().getInputStream())
            } else if (bgImageUri.startsWith("file://")) {
              val fileUri = Uri.parse(bgImageUri) ?: return
              if (fileUri.scheme != "file") {
                return
              }
              BitmapFactory.decodeFile(fileUri.path)
            } else {
              val context = reactApplicationContext.applicationContext
              val resourceId = context.resources.getIdentifier(bgImageUri, "drawable", context.packageName)
              BitmapFactory.decodeResource(context.resources, resourceId)
            }
          if (bitmap == null) {
            promise?.reject("6004", "Image Bitmap cannot be converted from passed `source.uri` in background data!")
            return
          }
          virtualBackgroundPlugin.enableBackground(bitmap)
          promise?.resolve(true)
        } catch (e: Exception) {
          promise?.reject("6004", e.message)
        }
      }
      else -> {
        promise?.reject("6004", "Unknown `type` property passed in background object")
      }
    }
  }

  @ReactMethod
  fun disableVideoPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsRnSDK = getHmsRNSdk(data)
    if (hmsRnSDK == null) {
      promise?.reject("6004", "HMSRNSDK not initialized")
      return
    }
    val hmsSDK = hmsRnSDK.hmsSDK
    if (hmsSDK == null) {
      promise?.reject("6004", "HMSSDK not initialized")
      return
    }
    val virtualBackgroundPlugin = virtualBackgroundPlugin
    if (virtualBackgroundPlugin == null) {
      promise?.reject("6004", "HMSVirtualBackground is already disabled!")
      return
    }
    val pluginType = data.getString("type")
    if (pluginType == null) {
      promise?.reject("6004", "`type` not passed")
      return
    }
    when (pluginType) {
      "HMSVirtualBackgroundPlugin" -> {
        val moduleInstance = this
        hmsSDK.removePlugin(
          virtualBackgroundPlugin,
          object : HMSActionResultListener {
            override fun onError(error: HMSException) {
              promise?.reject(error.code.toString(), error.message)
            }

            override fun onSuccess() {
              promise?.resolve(true)
              moduleInstance.virtualBackgroundPlugin = null
            }
          },
        )
      }
      else -> {
        promise?.reject("6004", "Unknown `type` passed")
      }
    }
  }

  @ReactMethod
  fun enableVideoPlugin(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val hmsSDK = getHmsRNSdk(data)?.hmsSDK ?: return promise?.reject("6004", "SDK not initialized").let { }
    val pluginType = data.getString("type") ?: return promise?.reject("6004", "`type` not passed").let { }

    if (pluginType == "HMSVirtualBackgroundPlugin") {
      val addPluginListener =
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            promise?.reject(error.code.toString(), error.message)
          }

          override fun onSuccess() {
            promise?.resolve(true)
          }
        }

      virtualBackgroundPlugin?.let {
        hmsSDK.addPlugin(it, addPluginListener)
      } ?: run {
        HMSVirtualBackground(hmsSDK).apply {
          enableBlur(75)
          virtualBackgroundPlugin = this
          hmsSDK.addPlugin(this, addPluginListener)
        }
      }
    } else {
      promise?.reject("6004", "Unknown `type` passed")
    }
  }

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

  companion object {
    const val NAME = "ReactNativeVideoPlugin"
  }
}
