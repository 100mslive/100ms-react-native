package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import androidx.media3.common.Player
import androidx.media3.common.VideoSize
import androidx.media3.common.text.CueGroup
import androidx.media3.ui.PlayerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import live.hms.hls_player.*
import live.hms.stats.PlayerStatsListener
import live.hms.stats.model.PlayerStatsModel
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSSDK
import live.hms.video.sdk.models.enums.HMSStreamingState
import java.util.concurrent.TimeUnit

@SuppressLint("ViewConstructor")
class HMSHLSPlayer(
  context: ReactContext,
) : FrameLayout(context) {
  private var playerView: PlayerView? = null // Exoplayer View
  private var hmsHlsPlayer: HmsHlsPlayer? = null // 100ms HLS Player
  private var hmssdkInstance: HMSSDK? = null
  private var statsMonitorAttached = false
  private var shouldSendCaptionsToJS = false
  private val hmsHlsPlaybackEventsObject =
    object : HmsHlsPlaybackEvents {
      override fun onCue(cue: HmsHlsCue) {
        super.onCue(cue)

        val data = Arguments.createMap()
        cue.endDate?.let { data.putString("endDate", it.time.toString()) }
        cue.id?.let { data.putString("id", it) }
        cue.payloadval?.let { data.putString("payloadval", it) }
        data.putString("startDate", cue.startDate.time.toString())

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_CUE_EVENT, data)
      }

      override fun onPlaybackFailure(error: HmsHlsException) {
        super.onPlaybackFailure(error)

        val data = Arguments.createMap()

        // error
        val errorData = Arguments.createMap()
        errorData.putInt("errorCode", error.error.errorCode)
        errorData.putString("errorCodeName", error.error.errorCodeName)
        error.error.message?.let {
          errorData.putString("message", it)
        }

        data.putMap("error", errorData)

        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_FAILURE_EVENT, data)
      }

      override fun onPlaybackStateChanged(state: HmsHlsPlaybackState) {
        super.onPlaybackStateChanged(state)

        val data = Arguments.createMap()
        data.putString("state", state.name)
        sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_STATE_CHANGE_EVENT, data)
      }
    }
  private val hmsHlsPlayerStatsListenerObject =
    object : PlayerStatsListener {
      override fun onError(error: HMSException) {
        val data = Arguments.createMap()

        data.putString("action", error.action)
        data.putInt("code", error.code)
        data.putString("description", error.description)
        data.putBoolean("isTerminal", error.isTerminal)
        data.putString("message", error.message)
        data.putString("name", error.name)

        sendHLSStatsEventToJS(HMSHLSPlayerConstants.ON_STATS_EVENT_ERROR, data)
      }

      override fun onEventUpdate(playerStatsModel: PlayerStatsModel) {
        val data = Arguments.createMap()

        // bandwidth
        data.putInt("bandWidthEstimate", playerStatsModel.bandwidth.bandWidthEstimate.toInt())
        data.putInt("totalBytesLoaded", playerStatsModel.bandwidth.totalBytesLoaded.toInt())

        // bufferedDuration
        data.putInt("bufferedDuration", playerStatsModel.bufferedDuration.toInt())

        // distanceFromLive
        data.putInt("distanceFromLive", playerStatsModel.distanceFromLive.toInt())

        // frameInfo
        data.putInt("droppedFrameCount", playerStatsModel.frameInfo.droppedFrameCount)

        // videoInfo
        data.putInt("averageBitrate", playerStatsModel.videoInfo.averageBitrate)
        data.putInt("videoHeight", playerStatsModel.videoInfo.videoHeight)
        data.putInt("videoWidth", playerStatsModel.videoInfo.videoWidth)

        sendHLSStatsEventToJS(HMSHLSPlayerConstants.ON_STATS_EVENT_UPDATE, data)
      }
    }

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    // Inflating player_view xml
    val view = inflater.inflate(R.layout.player_view, this)

    // getting Exoplayer View from above xml
    val localPlayerView = view.findViewById<PlayerView>(R.id.hls_view)
    playerView = localPlayerView
    localPlayerView.useController = false
    localPlayerView.subtitleView?.visibility = View.GONE

    val hmssdkCollection = context.getNativeModule(HMSManager::class.java)?.getHmsInstance()
    hmssdkInstance = hmssdkCollection?.get("12345")?.hmsSDK

    // creating 100ms HLS Player
    val localHmsHlsPlayer = HmsHlsPlayer(context, hmssdkInstance)
    hmsHlsPlayer = localHmsHlsPlayer

    // Attaching HLS Player Playback State Events listener
    localHmsHlsPlayer.addPlayerEventListener(hmsHlsPlaybackEventsObject)

    // setting 100ms HLS Player on Exoplayer
    localPlayerView.player = localHmsHlsPlayer.getNativePlayer()

    localPlayerView?.player?.addListener(
      object : Player.Listener {
        override fun onVideoSizeChanged(videoSize: VideoSize) {
          super.onVideoSizeChanged(videoSize)

          if (videoSize.height != 0 && videoSize.width != 0) {
            val width = videoSize.width.toDouble()
            val height = videoSize.height.toDouble()

            val data = Arguments.createMap()
            data.putDouble("width", width)
            data.putDouble("height", height)
            sendHLSPlaybackEventToJS(HMSHLSPlayerConstants.ON_PLAYBACK_RESOLUTION_CHANGE_EVENT, data)
          }
        }

        override fun onCues(cueGroup: CueGroup) {
          super.onCues(cueGroup)
          if (!shouldSendCaptionsToJS) return
          val ccText =
            cueGroup.cues
              .firstOrNull()
              ?.text
              ?.toString()
          sendHLSPlayerCuesEventToJS(ccText)
        }
      },
    )
  }

  fun cleanup() {
    hmsHlsPlayer?.stop()
    hmsHlsPlayer?.addPlayerEventListener(null)
    hmsHlsPlayer?.setStatsMonitor(null)
  }

  fun play(url: String?) {
    if (url !== null && url.isNotEmpty()) {
      hmsHlsPlayer?.play(url)
      return
    }

    val hlsStreamingState = this.hmssdkInstance?.getRoom()?.hlsStreamingState

    val defaultURL: String? =
      hlsStreamingState?.let {
        if (it.state == HMSStreamingState.STARTED) {
          it.variants?.get(0)?.hlsStreamUrl
        } else {
          null
        }
      }

    if (defaultURL !== null) {
      hmsHlsPlayer?.play(defaultURL)
    }
  }

  fun stop() {
    hmsHlsPlayer?.stop()
  }

  fun pause() {
    hmsHlsPlayer?.pause()
  }

  fun resume() {
    hmsHlsPlayer?.resume()
  }

  fun seekForward(seconds: Double) {
    hmsHlsPlayer?.seekForward(seconds.toLong(), TimeUnit.SECONDS)
  }

  fun seekBackward(seconds: Double) {
    hmsHlsPlayer?.seekBackward(seconds.toLong(), TimeUnit.SECONDS)
  }

  fun seekToLivePosition() {
    hmsHlsPlayer?.seekToLivePosition()
  }

  fun setVolume(level: Int) {
    hmsHlsPlayer?.volume = level
  }

  fun areClosedCaptionSupported(requestId: Int) {
    hmsHlsPlayer.let {
      if (it == null) {
        sendHLSDataRequestEventToJS(requestId, false)
      } else {
        sendHLSDataRequestEventToJS(requestId, it.areClosedCaptionsSupported())
      }
    }
  }

  fun isClosedCaptionEnabled(requestId: Int) {
    sendHLSDataRequestEventToJS(requestId, shouldSendCaptionsToJS)
  }

  fun enableClosedCaption() {
    shouldSendCaptionsToJS = true
  }

  fun disableClosedCaption() {
    shouldSendCaptionsToJS = false
    sendHLSPlayerCuesEventToJS(null)
  }

  fun getPlayerDurationDetails(requestId: Int) {
    val data: WritableMap = Arguments.createMap()
    hmsHlsPlayer?.getNativePlayer()?.let { exoPlayer ->
      data.putInt(
        "rollingWindowTime",
        exoPlayer.seekParameters.toleranceAfterUs
          .div(1000)
          .toInt(),
      )
      data.putInt("streamDuration", exoPlayer.duration.toInt())
    }
    sendHLSDataRequestEventToJS(requestId, data)
  }

  fun enableStats(enable: Boolean) {
    if (enable) {
      attachStatsMonitor()
    } else {
      removeStatsMonitor()
    }
  }

  fun enableControls(show: Boolean) {
    playerView?.let {
      if (show) {
        it.subtitleView?.visibility = View.VISIBLE
        it.useController = true
        it.showController()
      } else {
        it.hideController()
        it.useController = false
        it.subtitleView?.visibility = View.GONE
      }
    }
  }

  private fun attachStatsMonitor() {
    if (statsMonitorAttached) return

    hmsHlsPlayer?.let {
      it.setStatsMonitor(hmsHlsPlayerStatsListenerObject)
      statsMonitorAttached = true
    }
  }

  private fun removeStatsMonitor() {
    if (!statsMonitorAttached) return

    hmsHlsPlayer?.setStatsMonitor(null)
    statsMonitorAttached = false
  }

  private fun sendHLSPlaybackEventToJS(
    eventName: String,
    data: WritableMap,
  ) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    event.putMap("data", data)

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HMS_HLS_PLAYBACK_EVENT, event)
  }

  private fun sendHLSStatsEventToJS(
    eventName: String,
    data: WritableMap,
  ) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    event.putMap("data", data)

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HMS_HLS_STATS_EVENT, event)
  }

  private fun sendHLSDataRequestEventToJS(
    requestId: Int,
    data: Any,
  ) {
    val event: WritableMap = Arguments.createMap()
    event.putInt("requestId", requestId)

    if (data is Boolean) {
      event.putBoolean("data", data)
    } else if (data is String) {
      event.putString("data", data)
    } else if (data is Int) {
      event.putInt("data", data)
    } else if (data is Double) {
      event.putDouble("data", data)
    } else if (data is ReadableMap) {
      event.putMap("data", data)
    } else if (data is ReadableArray) {
      event.putArray("data", data)
    } else {
      event.putNull("data")
    }

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HLS_DATA_REQUEST_EVENT, event)
  }

  private fun sendHLSPlayerCuesEventToJS(ccText: String?) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", HMSHLSPlayerConstants.ON_CLOSED_CAPTION_UPDATE)

    if (ccText is String) {
      event.putString("data", ccText)
    } else {
      event.putNull("data")
    }
    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HLS_PLAYER_CUES_EVENT, event)
  }
}

object HMSHLSPlayerConstants {
  // HLS Playback Events
  const val HMS_HLS_PLAYBACK_EVENT = "hmsHlsPlaybackEvent"
  const val ON_PLAYBACK_CUE_EVENT = "ON_PLAYBACK_CUE_EVENT"
  const val ON_PLAYBACK_FAILURE_EVENT = "ON_PLAYBACK_FAILURE_EVENT"
  const val ON_PLAYBACK_STATE_CHANGE_EVENT = "ON_PLAYBACK_STATE_CHANGE_EVENT"
  const val ON_PLAYBACK_RESOLUTION_CHANGE_EVENT = "ON_PLAYBACK_RESOLUTION_CHANGE_EVENT"

  // HLS Playback Stats Events
  const val HMS_HLS_STATS_EVENT = "hmsHlsStatsEvent"
  const val ON_STATS_EVENT_UPDATE = "ON_STATS_EVENT_UPDATE"
  const val ON_STATS_EVENT_ERROR = "ON_STATS_EVENT_ERROR"

  // HLS Requested Data Returned
  const val HLS_DATA_REQUEST_EVENT = "hlsDataRequestEvent"

  // HLS Player Cues Events
  const val HLS_PLAYER_CUES_EVENT = "hlsPlayerCuesEvent"
  const val ON_CLOSED_CAPTION_UPDATE = "ON_CLOSED_CAPTION_UPDATE"
}
