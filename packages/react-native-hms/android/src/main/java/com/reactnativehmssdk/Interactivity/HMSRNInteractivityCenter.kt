package com.reactnativehmssdk
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import live.hms.video.error.HMSException
import live.hms.video.interactivity.HmsInteractivityCenter
import live.hms.video.interactivity.HmsPollUpdateListener
import live.hms.video.polls.models.HMSPollUpdateType
import live.hms.video.polls.models.HmsPoll
import live.hms.video.sdk.HMSActionResultListener

class HMSRNInteractivityCenter(val center: HmsInteractivityCenter) {
  init {
    // Listen for poll updates
    this.center.pollUpdateListener =
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
        }
      }
  }

  // region Create Polls

  fun quickStartPoll(
    data: ReadableMap,
    promise: Promise?,
  ) {
    center.quickStartPoll(
      HMSInteractivityHelper.getPollBuilder(data),
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

  // region

  // region Poll Update Listener

  fun showPollStartedToast() {
    // Show toast
  }

  fun loadResultsSummaryIfNeeded() {
    // Load results summary
  }

  fun updateResultsScreen() {
    // Update results screen
  }
  // endregion
}
