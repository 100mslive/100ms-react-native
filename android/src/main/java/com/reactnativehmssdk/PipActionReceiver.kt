package com.reactnativehmssdk

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log

class PipActionReceiver(): BroadcastReceiver() {
  companion object {
    var isRegistered = false
    const val PIP_INTENT_ACTION = "PIP_INTENT_ACTION"
  }

  override fun onReceive(context: Context?, intent: Intent?) {
    if (intent !== null) {
      Log.i("PipActionReceiver", "Received Broadcast")
      if (intent.hasExtra("End")) {
        // TODO: "Add End call logic here"
        Log.i("PipActionReceiver", "End Call!")
      } else if (intent.hasExtra("Mic")) {
        // TODO: "Add Toggle Local Mic logic here"
        Log.i("PipActionReceiver", "Toggle Mic!")
      } else if (intent.hasExtra("Camera")) {
        // TODO: "Add Toggle Local Camera logic here"
        Log.i("PipActionReceiver", "Toggle Camera!")
      }
    }
  }

  fun register(activity: Activity) {
    if (isRegistered) {
      Log.i("PipActionReceiver", "Tried to register PIPActionReceiver: Already Registered!")
      return;
    }

    IntentFilter().also {
      it.addAction(PIP_INTENT_ACTION)
      activity.registerReceiver(this, it)
      isRegistered = true
    }
  }

  fun unregister(activity: Activity) {
    if (!isRegistered) {
      Log.i("PipActionReceiver", "Tried to unregister PIPActionReceiver: Already Not Registered!")
      return;
    }

    activity.unregisterReceiver(this)
    isRegistered = false
  }
}
