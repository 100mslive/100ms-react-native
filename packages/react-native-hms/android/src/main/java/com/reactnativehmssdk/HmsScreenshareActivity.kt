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
        HMSManagerImpl.hmsCollection[id]?.hmsSDK?.startScreenshare(
          object : HMSActionResultListener {
            override fun onError(error: HMSException) {
              finish()
              HMSManagerImpl.hmsCollection[id]?.screenshareCallback?.reject(error)
            }

            override fun onSuccess() {
              HMSManagerImpl.hmsCollection[id]?.screenshareCallback?.resolve(
                HMSManagerImpl.hmsCollection[id]?.getPromiseResolveData(),
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
        HMSManagerImpl.hmsCollection[id]?.screenshareCallback?.reject(error)
        finish()
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    startScreenshare()
  }

  private fun startScreenshare() {
    val id = intent.getStringExtra("id")
    val isScreenShared = HMSManagerImpl.hmsCollection[id]?.hmsSDK?.isScreenShared()
    if (isScreenShared !== null && !isScreenShared) {
      try {
        val mediaProjectionManager =
          getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        resultLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
      } catch (e: Exception) {
        println(e)
      }
      HMSManagerImpl.startingScreenShare = false
    } else {
      HMSManagerImpl.startingScreenShare = false
      HMSManagerImpl.hmsCollection[id]?.emitHMSError(
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
