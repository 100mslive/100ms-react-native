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

class HMSAudioshareActivity : ComponentActivity() {
  private var resultLauncher: ActivityResultLauncher<Intent> =
    this.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      if (result.resultCode == Activity.RESULT_OK) {
        val mediaProjectionPermissionResultData: Intent? = result.data
        val id = intent.getStringExtra("id")
        val audioMixingMode = intent.getStringExtra("audioMixingMode")
        HMSManagerImpl.hmsCollection[id]?.hmsSDK?.startAudioshare(
          object : HMSActionResultListener {
            override fun onError(error: HMSException) {
              finish()
              HMSManagerImpl.hmsCollection[id]?.audioshareCallback?.reject(error)
            }

            override fun onSuccess() {
              HMSManagerImpl.hmsCollection[id]?.isAudioSharing = true
              HMSManagerImpl.hmsCollection[id]?.audioshareCallback?.resolve(
                HMSManagerImpl.hmsCollection[id]?.getPromiseResolveData(),
              )
              finish()
            }
          },
          mediaProjectionPermissionResultData,
          HMSHelper.getAudioMixingMode(audioMixingMode),
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
        HMSManagerImpl.hmsCollection[id]?.audioshareCallback?.reject(error)
        finish()
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    startAudioshare()
  }

  private fun startAudioshare() {
    val id = intent.getStringExtra("id")
    val isAudioShared = HMSManagerImpl.hmsCollection[id]?.isAudioSharing
    if (isAudioShared !== null && !isAudioShared) {
      try {
        val mediaProjectionManager =
          getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        resultLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
      } catch (e: Exception) {
        println(e)
      }
    } else {
      HMSManagerImpl.hmsCollection[id]?.emitHMSError(
        HMSException(
          103,
          "AUDIOSHARE_IS_ALREADY_RUNNING",
          "AUDIOSHARE_IS_ALREADY_RUNNING",
          "AUDIOSHARE_IS_ALREADY_RUNNING",
          "AUDIOSHARE_IS_ALREADY_RUNNING",
        ),
      )
      finish()
    }
  }
}
