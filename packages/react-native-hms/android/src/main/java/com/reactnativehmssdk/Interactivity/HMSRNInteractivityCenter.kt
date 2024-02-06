package com.reactnativehmssdk
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.reactnativehmssdk.Interactivity.HMSInteractivityDecoder
import live.hms.video.error.HMSException
import live.hms.video.interactivity.HmsPollUpdateListener
import live.hms.video.polls.models.HMSPollUpdateType
import live.hms.video.polls.models.HmsPoll
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.sdk.HMSSDK

class HMSRNInteractivityCenter(private val sdk: HMSSDK, private val rnSDK: HMSRNSDK) {
  init {
    // Listen for poll updates
    this.sdk.getHmsInteractivityCenter().pollUpdateListener =
      object : HmsPollUpdateListener {
        override fun onPollUpdate(
          hmsPoll: HmsPoll,
          hmsPollUpdateType: HMSPollUpdateType,
        ) {
          when (hmsPollUpdateType) {
            HMSPollUpdateType.started -> showPollStartedToast()
            HMSPollUpdateType.stopped -> loadResultsSummaryIfNeeded()
            HMSPollUpdateType.resultsupdated -> updateResultsScreen()
          }

          if (rnSDK.eventsEnableStatus["ON_POLL_UPDATE"] != true) {
            return
          }

          val data: WritableMap = Arguments.createMap()

          data.putInt("update", HMSInteractivityDecoder.getPollUpdateType(hmsPollUpdateType))
          data.putMap("updatedPoll", HMSInteractivityDecoder.getPoll(hmsPoll))

          rnSDK.delegate.emitEvent("ON_POLL_UPDATE", data)
        }
      }
  }

  // region Create Polls

  fun quickStartPoll(
    data: ReadableMap,
    promise: Promise?,
  ) {
    this.sdk.getHmsInteractivityCenter().quickStartPoll(
      HMSInteractivityHelper.getPollBuilder(data, sdk.getRoles()),
      object : HMSActionResultListener {
        override fun onError(error: HMSException) {
          // Error
          promise?.reject(error.message, error)
        }

        override fun onSuccess() {
          // Success
          promise?.resolve(null)
        }
      },
    )
  }

  // endregion

  // region Poll Update Listener

  fun showPollStartedToast() {
    // Show toast
    Log.e("Interactivity", "showPollStartedToast")
  }

  fun loadResultsSummaryIfNeeded() {
    // Load results summary
    Log.e("Interactivity", "loadResultsSummaryIfNeeded")
  }

  fun updateResultsScreen() {
    // Update results screen
    Log.e("Interactivity", "updateResultsScreen")
  }
  // endregion
}
