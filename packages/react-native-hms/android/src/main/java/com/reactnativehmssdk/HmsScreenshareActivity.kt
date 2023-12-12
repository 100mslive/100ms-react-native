package com.reactnativehmssdk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSActionResultListener

class HmsScreenshareActivity : ComponentActivity() {
  private var resultLauncher: ActivityResultLauncher<Intent> =
    this.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      if (result.resultCode == Activity.RESULT_OK) {
        val mediaProjectionPermissionResultData: Intent? = result.data
        val id = intent.getStringExtra("id")
        HMSManager.hmsCollection[id]?.hmsSDK?.startScreenshare(
          object : HMSActionResultListener {
            override fun onError(error: HMSException) {
              finish()
              HMSManager.hmsCollection[id]?.screenshareCallback?.reject(error)
              HMSManager.hmsCollection[id]?.emitHMSError(error)
            }

            override fun onSuccess() {
              HMSManager.hmsCollection[id]?.screenshareCallback?.resolve(
                HMSManager.hmsCollection[id]?.getPromiseResolveData(),
              )
              finish()
            }
          },
          mediaProjectionPermissionResultData,
        )
      } else {
        val id = intent.getStringExtra("id")
        val error =
          HMSException(
            103,
            "RESULT_CANCELED",
            "RESULT_CANCELED",
            "RESULT_CANCELED",
            "RESULT_CANCELED",
          )
        HMSManager.hmsCollection[id]?.screenshareCallback?.reject(error)
        HMSManager.hmsCollection[id]?.emitHMSError(error)
        finish()
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    startScreenshare()
  }

  private fun startScreenshare() {
    val id = intent.getStringExtra("id")
    val isScreenShared = HMSManager.hmsCollection[id]?.hmsSDK?.isScreenShared()
    if (isScreenShared !== null && !isScreenShared) {
      try {
        val mediaProjectionManager =
          getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        resultLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
      } catch (e: Exception) {
        println(e)
      }
      HMSManager.startingScreenShare = false
    } else {
      HMSManager.startingScreenShare = false
      HMSManager.hmsCollection[id]?.emitHMSError(
        HMSException(
          103,
          "SCREENSHARE_IS_ALREADY_RUNNING",
          "SCREENSHARE_IS_ALREADY_RUNNING",
          "SCREENSHARE_IS_ALREADY_RUNNING",
          "SCREENSHARE_IS_ALREADY_RUNNING",
        ),
      )
      finish()
    }
  }
}
