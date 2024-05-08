package com.reactnativehmssdk
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
import live.hms.video.polls.network.PollLeaderboardResponse
import live.hms.video.sdk.HMSActionResultListener
import live.hms.video.sdk.HMSSDK
import live.hms.video.sdk.HmsTypedActionResultListener
import live.hms.video.whiteboard.HMSWhiteboardUpdate
import live.hms.video.whiteboard.HMSWhiteboardUpdateListener

class HMSRNInteractivityCenter(private val sdk: HMSSDK, private val rnSDK: HMSRNSDK) {
  init {
    //region Listen for poll updates
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
    //endregion

    //region Listen for whiteboard updates
    this.sdk.getHmsInteractivityCenter().setWhiteboardUpdateListener(
      object : HMSWhiteboardUpdateListener {
        override fun onUpdate(hmsWhiteboardUpdate: HMSWhiteboardUpdate) {
          if (rnSDK.eventsEnableStatus["ON_WHITEBOARD_UPDATE"] != true) {
            return
          }
          val data: WritableMap = Arguments.createMap()
          when (hmsWhiteboardUpdate) {
            is HMSWhiteboardUpdate.Start -> {
              data.putMap("hmsWhiteboard", HMSInteractivityDecoder.getHMSWhiteboard(hmsWhiteboardUpdate.hmsWhiteboard))
              data.putString("updateType", HMSInteractivityDecoder.getWhiteboardUpdateType(hmsWhiteboardUpdate))
            }
            is HMSWhiteboardUpdate.Stop -> {
              data.putMap("hmsWhiteboard", HMSInteractivityDecoder.getHMSWhiteboard(hmsWhiteboardUpdate.hmsWhiteboard))
              data.putString("updateType", HMSInteractivityDecoder.getWhiteboardUpdateType(hmsWhiteboardUpdate))
            }
          }
          rnSDK.delegate.emitEvent("ON_WHITEBOARD_UPDATE", data)
        }
      },
    )
    //endregion
  }

  //region poll methods
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

  fun addResponseOnPollQuestion(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val pollId = data.getString("pollId")
    if (pollId == null) {
      promise?.reject("6004", "pollId is required")
      return
    }
    val poll = this.sdk.getHmsInteractivityCenter().polls.find { it.pollId == pollId }
    if (poll == null) {
      promise?.reject("6004", "No HMSPoll with pollId `$pollId`")
      return
    }
    val pollQuestionIndex = data.getInt("pollQuestionIndex")
    val pollQuestion = poll.questions?.find { it.questionID == pollQuestionIndex }
    if (pollQuestion == null) {
      promise?.reject("6004", "No HMSPollQuestion in poll with given question index")
      return
    }
    val responses = data.getMap("responses")
    if (responses == null) {
      promise?.reject("6004", "responses field is required")
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
      promise?.reject("6004", "pollId is required")
      return
    }
    val poll = this.sdk.getHmsInteractivityCenter().polls.find { it.pollId == pollId }
    if (poll == null) {
      promise?.reject("6004", "No HMSPoll with pollId `$pollId`")
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

  fun fetchLeaderboard(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val pollId = data.getString("pollId")
    if (pollId == null) {
      promise?.reject("6004", "pollId is required")
      return
    }
    val poll = this.sdk.getHmsInteractivityCenter().polls.find { it.pollId == pollId }
    if (poll == null) {
      promise?.reject("6004", "No HMSPoll with pollId `$pollId`")
      return
    }
    val count = data.getInt("count")
    val startIndex = data.getInt("startIndex")
    val includeCurrentPeer = data.getBoolean("includeCurrentPeer")

    this.sdk.getHmsInteractivityCenter().fetchLeaderboard(
      pollId = poll.pollId,
      count = count.toLong(),
      startIndex = startIndex.toLong(),
      includeCurrentPeer = includeCurrentPeer,
      object : HmsTypedActionResultListener<PollLeaderboardResponse> {
        override fun onSuccess(result: PollLeaderboardResponse) {
          promise?.resolve(HMSInteractivityDecoder.getPollLeaderboardResponse(result))
        }

        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.description)
        }
      },
    )
  }
  //endregion

  //region whiteboard methods
  fun startWhiteboard(
    data: ReadableMap,
    promise: Promise?,
  ) {
    val whiteboardTitle = data.getString("title")
    if (whiteboardTitle == null) {
      promise?.reject("6004", "whiteboard title is required")
      return
    }
    sdk.getHmsInteractivityCenter().startWhiteboard(
      whiteboardTitle,
      object : HMSActionResultListener {
        override fun onSuccess() {
          promise?.resolve(true)
        }

        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.description)
        }
      },
    )
  }

  fun stopWhiteboard(promise: Promise?) {
    sdk.getHmsInteractivityCenter().stopWhiteboard(
      object : HMSActionResultListener {
        override fun onSuccess() {
          promise?.resolve(true)
        }

        override fun onError(error: HMSException) {
          promise?.reject(error.code.toString(), error.description)
        }
      },
    )
  }
  //endregion
}
