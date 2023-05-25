package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import live.hms.hls_player.HmsHlsCue
import live.hms.hls_player.HmsHlsPlaybackEvents
import live.hms.hls_player.HmsHlsPlayer
import live.hms.video.sdk.HMSSDK

@SuppressLint("ViewConstructor")
class HMSPlayer(context: ReactContext) : FrameLayout(context) {
  private var playerView: PlayerView? = null // Exoplayer View
  private var hlsPlayer: HmsHlsPlayer? = null // 100ms HLS Player
  private var hmssdkInstance: HMSSDK? = null
  private val hmsHlsPlaybackEvents = object : HmsHlsPlaybackEvents {
    override fun onCue(cue: HmsHlsCue) {
      super.onCue(cue)

      val data = Arguments.createMap()
      cue.endDate?.let { data.putString("endDate", it.time.toString()) }
      cue.id?.let { data.putString("id", it) }
      cue.payloadval?.let { data.putString("payloadval", it) }
      data.putString("startDate", cue.startDate.time.toString())

      sendEventToJS(HMSPlayerConstants.HMS_HLS_PLAYBACK_EVENT, data)
    }
  }

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    // Inflating hms_player xml
    val view = inflater.inflate(R.layout.hms_player, this)

    // getting Exoplayer View from above xml
    val localPlayerView = view.findViewById<PlayerView>(R.id.hls_view)
    playerView = localPlayerView

    val hmssdkCollection = context.getNativeModule(HMSManager::class.java)?.getHmsInstance()
    hmssdkInstance = hmssdkCollection?.get("12345")?.hmsSDK

    // creating 100ms HLS Player
    val localHlsPlayer = HmsHlsPlayer(context, hmssdkInstance)
    hlsPlayer = localHlsPlayer

    // setting 100ms HLS Player on Exoplayer
    localPlayerView.player = localHlsPlayer.getNativePlayer()

    localPlayerView.findViewById<AspectRatioFrameLayout>(R.id.exo_content_frame).setAspectRatio(16f / 9f)

    attachHmsHlsPlayerListeners()
  }

  private fun attachHmsHlsPlayerListeners() {
//    this.removeHmsHlsPlayerListeners()

    hlsPlayer?.addPlayerEventListener(
      hmsHlsPlaybackEvents,
    )
  }

  private fun removeHmsHlsPlayerListeners() {
    hlsPlayer?.addPlayerEventListener(null)
  }

  fun cleanup() {
    removeHmsHlsPlayerListeners()
  }

  private fun sendEventToJS(eventName: String, data: WritableMap?) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    data?.let {
      event.putMap("data", it)
    }

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, HMSPlayerConstants.HMS_HLS_PLAYBACK_EVENT, event)
  }

  // override fun onAttachedToWindow() {
  //   super.onAttachedToWindow()
  // }

  // override fun onDetachedFromWindow() {
  //   super.onDetachedFromWindow()
  // }

  fun play(url: String?) {
    if (url !== null && url.isNotEmpty()) {
      hlsPlayer?.play(url)
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
      hlsPlayer?.play(defaultURL)
    }
  }
}

object HMSPlayerConstants {
  const val HMS_HLS_PLAYBACK_EVENT = "hmsHlsPlaybackEvent"
  const val ON_HMS_HLS_PLAYER_CUE = "ON_HMS_HLS_PLAYER_CUE"
}
