package com.reactnativehmssdk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.sdk.HMSSDK

class HmsScreenshareActivity : ComponentActivity() {

  private var hmsSDK: HMSSDK? = null
  private var isScreenShared = false
  private var resultLauncher: ActivityResultLauncher<Intent> =
      this.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
          val mediaProjectionPermissionResultData: Intent? = result.data
          hmsSDK?.startScreenshare(
              object : HMSActionResultListener {
                override fun onError(error: HMSException) {}
                override fun onSuccess() {
                  isScreenShared = true
                }
              },
              mediaProjectionPermissionResultData
          )
        }
      }

  init {
    //    this.hmsSDK = sdk
  }

  override fun onDestroy() {
    super.onDestroy()
    hmsSDK?.stopScreenshare(
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {}
          override fun onSuccess() {
            isScreenShared = false
          }
        }
    )
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
//    getReactNativeHost()
    startScreenshare()
//    this.applicationContext
  }

  fun startScreenshare() {
    if (!isScreenShared) {
      try {
        val mediaProjectionManager =
            getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        resultLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
        //        callback?.resolve(result)
      } catch (e: Exception) {
        println(e)
      }
    } else {
      //      callback?.reject("101", "ScreenShare already running!")
    }
  }

  fun stopScreenshare(callback: Promise?) {
    hmsSDK?.stopScreenshare(
        object : HMSActionResultListener {
          override fun onError(error: HMSException) {
            callback?.reject(error.code.toString(), error.message)
          }

          override fun onSuccess() {
            val result: WritableMap = Arguments.createMap()
            result.putBoolean("success", true)
            callback?.resolve(result)
          }
        }
    )
  }
}
