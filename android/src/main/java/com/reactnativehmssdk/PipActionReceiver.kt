package com.reactnativehmssdk

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import androidx.annotation.RequiresApi

data class PIPAction(val title: String, val description: String, val requestCode: Int)

data class PIPActions(val endMeet: PIPAction, val localAudio: PIPAction, val localVideo: PIPAction)

@RequiresApi(Build.VERSION_CODES.O)
class PipActionReceiver(
  val toggleLocalAudio: () -> Unit,
  val toggleLocalVideo: () -> Unit,
  val endMeeting: () -> Unit
) : BroadcastReceiver() {
  companion object {
    var sdkIdForPIP: String? = null
    private var registered = false
    const val PIP_INTENT_ACTION = "PIP_INTENT_ACTION"
    val PIPActions = PIPActions(
      endMeet = PIPAction(title = "End", description = "End Meeting", requestCode = 346),
      localAudio = PIPAction(title = "Mic", description = "Toggle Mic", requestCode = 344),
      localVideo = PIPAction(title = "Camera", description = "Toggle Camera", requestCode = 345)
    )
  }

  override fun onReceive(context: Context?, intent: Intent?) {
    if (intent !== null) {
      if (intent.hasExtra(PIPActions.endMeet.title)) {
        return endMeeting()
      }
      if (intent.hasExtra(PIPActions.localAudio.title)) {
        return toggleLocalAudio()
      }
      if (intent.hasExtra(PIPActions.localVideo.title)) {
        return toggleLocalVideo()
      }
    }
  }

  fun register(activity: Activity) {
    if (registered) {
      return
    }

    IntentFilter().also {
      it.addAction(PIP_INTENT_ACTION)
      activity.registerReceiver(this, it)
    }
    registered = true
  }

  fun unregister(activity: Activity) {
    if (!registered) {
      return
    }

    activity.unregisterReceiver(this)
    registered = false
  }
}
