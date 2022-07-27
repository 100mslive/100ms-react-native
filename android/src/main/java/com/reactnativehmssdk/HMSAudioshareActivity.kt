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
          HMSManager.hmsCollection[id]?.hmsSDK?.startAudioshare(
              object : HMSActionResultListener {
                override fun onError(error: HMSException) {
                  finish()
                  HMSManager.hmsCollection[id]?.audioshareCallback?.reject(error)
                  HMSManager.hmsCollection[id]?.emitHMSError(error)
                }
                override fun onSuccess() {
                  HMSManager.hmsCollection[id]?.isAudioSharing = true
                  HMSManager.hmsCollection[id]?.audioshareCallback?.resolve(
                      HMSManager.hmsCollection[id]?.emitHMSSuccess()
                  )
                  finish()
                }
              },
              mediaProjectionPermissionResultData,
              HMSHelper.getAudioMixingMode(audioMixingMode)
          )
        } else {
          val id = intent.getStringExtra("id")
          val error =
              HMSException(
                  103,
                  "RESULT_CANCELED",
                  "RESULT_CANCELED",
                  "RESULT_CANCELED",
                  "RESULT_CANCELED"
              )
          HMSManager.hmsCollection[id]?.audioshareCallback?.reject(error)
          HMSManager.hmsCollection[id]?.emitHMSError(error)
          finish()
        }
      }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    startAudioshare()
  }

  private fun startAudioshare() {
    val id = intent.getStringExtra("id")
    val isAudioShared = HMSManager.hmsCollection[id]?.isAudioSharing
    if (isAudioShared !== null && !isAudioShared) {
      try {
        val mediaProjectionManager =
            getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        resultLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
      } catch (e: Exception) {
        println(e)
      }
    } else {
      HMSManager.hmsCollection[id]?.emitHMSError(
          HMSException(
              103,
              "AUDIOSHARE_IS_ALREADY_RUNNING",
              "AUDIOSHARE_IS_ALREADY_RUNNING",
              "AUDIOSHARE_IS_ALREADY_RUNNING",
              "AUDIOSHARE_IS_ALREADY_RUNNING"
          )
      )
      finish()
    }
  }
}
