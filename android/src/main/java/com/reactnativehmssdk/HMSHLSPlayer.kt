package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.media3.ui.PlayerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import live.hms.hls_player.*
import live.hms.stats.PlayerStatsListener
import live.hms.stats.model.PlayerStatsModel
import live.hms.video.error.HMSException
import live.hms.video.sdk.HMSSDK

@SuppressLint("ViewConstructor")
class HMSHLSPlayer(context: ReactContext) : FrameLayout(context) {
  private var playerView: PlayerView? = null // Exoplayer View
  private var hmsHlsPlayer: HmsHlsPlayer? = null // 100ms HLS Player
  private var hmssdkInstance: HMSSDK? = null
  private var statsMonitorAttached = false
  private val hmsHlsPlaybackEventsObject = object : HmsHlsPlaybackEvents {
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
  private val hmsHlsPlayerStatsListenerObject = object : PlayerStatsListener {
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
      data.putInt("totalFrameCount", playerStatsModel.frameInfo.totalFrameCount)

      // videoInfo
      data.putInt("averageBitrate", playerStatsModel.videoInfo.averageBitrate)
      data.putDouble("frameRate", playerStatsModel.videoInfo.frameRate.toDouble())
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

    val hmssdkCollection = context.getNativeModule(HMSManager::class.java)?.getHmsInstance()
    hmssdkInstance = hmssdkCollection?.get("12345")?.hmsSDK

    // creating 100ms HLS Player
    val localHmsHlsPlayer = HmsHlsPlayer(context, hmssdkInstance)
    hmsHlsPlayer = localHmsHlsPlayer

    // Attaching HLS Player Playback State Events listener
    localHmsHlsPlayer.addPlayerEventListener(hmsHlsPlaybackEventsObject)

    // setting 100ms HLS Player on Exoplayer
    localPlayerView.player = localHmsHlsPlayer.getNativePlayer()
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

    val defaultURL: String? = hlsStreamingState?.let {
      if (it.running) {
        it.variants?.get(0)?.hlsStreamUrl
      } else {
        null
      }
    }

    if (defaultURL !== null) {
      hmsHlsPlayer?.play(defaultURL)
    }
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
        it.useController = true
        it.showController()
      } else {
        it.hideController()
        it.useController = false
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

  private fun sendHLSPlaybackEventToJS(eventName: String, data: WritableMap) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    event.putMap("data", data)

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HMS_HLS_PLAYBACK_EVENT, event)
  }

  private fun sendHLSStatsEventToJS(eventName: String, data: WritableMap) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    event.putMap("data", data)

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSHLSPlayerConstants.HMS_HLS_STATS_EVENT, event)
  }
}

object HMSHLSPlayerConstants {
  // HLS Playback Events
  const val HMS_HLS_PLAYBACK_EVENT = "hmsHlsPlaybackEvent"
  const val ON_PLAYBACK_CUE_EVENT = "ON_PLAYBACK_CUE_EVENT"
  const val ON_PLAYBACK_FAILURE_EVENT = "ON_PLAYBACK_FAILURE_EVENT"
  const val ON_PLAYBACK_STATE_CHANGE_EVENT = "ON_PLAYBACK_STATE_CHANGE_EVENT"

  // HLS Playback Stats Events
  const val HMS_HLS_STATS_EVENT = "hmsHlsStatsEvent"
  const val ON_STATS_EVENT_UPDATE = "ON_STATS_EVENT_UPDATE"
  const val ON_STATS_EVENT_ERROR = "ON_STATS_EVENT_ERROR"
}
