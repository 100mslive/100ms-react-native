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
import live.hms.video.polls.models.answer.PollAnswerResponse
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.sdk.HMSSDK
import live.hms.video.sdk.HmsTypedActionResultListener

class HMSRNInteractivityCenter(private val sdk: HMSSDK, private val rnSDK: HMSRNSDK) {
  init {
    // Listen for poll updates
    this.sdk.getHmsInteractivityCenter().pollUpdateListener =
      object : HmsPollUpdateListener {
        override fun onPollUpdate(
          hmsPoll: HmsPoll,
          hmsPollUpdateType: HMSPollUpdateType,
        ) {
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

  /*

  func add(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let pollId = data["pollId"] as? String,
              let poll = self.hmssdk?.interactivityCenter.polls.first(where: {poll in poll.pollID == pollId}) else {
            reject?("6004", "Unable to find HMSPoll with given pollId", nil)
            return
        }
        guard let pollQuestionIndex = data["pollQuestionIndex"] as? Int,
              let pollQuestion = poll.questions?.first(where: {question in question.index == pollQuestionIndex}) else {
            reject?("6004", "Unable to find HMSPollQuestion in poll with given question index", nil)
            return
        }
        guard let responses = data["responses"] as? NSDictionary else {
            reject?("6004", "responses field is required", nil)
            return
        }

        let pollResponseBuilder = HMSInteractivityHelper.getPollResponseBuilder(responses, poll: poll, pollQuestion: pollQuestion)

        self.hmssdk?.interactivityCenter.add(response: pollResponseBuilder) { pollQuestionResponseResult, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            if let pollQuestionResponseResult = pollQuestionResponseResult {
                resolve?(HMSInteractivityDecoder.getHMSPollQuestionResponseResults(pollQuestionResponseResult))
            } else {
                resolve?(nil)
            }
        }
    }

   */

  fun addResponseOnPollQuestion(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val pollId = data.getString("pollId")
    if (pollId == null) {
      promise?.reject("6002", "pollId is required")
      return
    }
    val poll = this.sdk.getHmsInteractivityCenter().polls.find { it.pollId == pollId }
    if (poll == null) {
      promise?.reject("6002", "No HMSPoll with pollId `$pollId`")
      return
    }
    val pollQuestionIndex = data.getInt("pollQuestionIndex")
    val pollQuestion = poll.questions?.find { it.questionID == pollQuestionIndex }
    if (pollQuestion == null) {
      promise?.reject("6002", "No HMSPollQuestion in poll with given question index")
      return
    }
    val responses = data.getMap("responses")
    if (responses == null) {
      promise?.reject("6002", "responses field is required")
      return
    }
    val pollResponseBuilder = HMSInteractivityHelper.getPollResponseBuilder(responses, poll, pollQuestion)
    this.sdk.getHmsInteractivityCenter().add(
      pollResponseBuilder,
      object : HmsTypedActionResultListener<PollAnswerResponse> {
        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.description)
        }

        override fun onSuccess(result: PollAnswerResponse) {
          promise?.resolve(HMSInteractivityDecoder.getHMSPollQuestionResponseResults(result))
        }
      },
    )
  }

  fun stop(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val pollId = data.getString("pollId")
    if (pollId == null) {
      promise?.reject("6002", "pollId is required")
      return
    }
    val poll = this.sdk.getHmsInteractivityCenter().polls.find { it.pollId == pollId }
    if (poll == null) {
      promise?.reject("6002", "No HMSPoll with pollId `$pollId`")
      return
    }
    this.sdk.getHmsInteractivityCenter().stop(
      poll,
      object : HMSActionResultListener {
        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.description)
        }

        override fun onSuccess() {
          promise?.resolve(true)
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
