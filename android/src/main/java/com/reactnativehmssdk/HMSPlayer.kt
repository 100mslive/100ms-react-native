package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.facebook.react.bridge.ReactContext
import live.hms.hls_player.HmsHlsPlayer
import live.hms.video.sdk.HMSSDK

@SuppressLint("ViewConstructor")
class HMSPlayer(context: ReactContext) : FrameLayout(context) {
  private var playerView: PlayerView? = null // Exoplayer View
  private var hlsPlayer: HmsHlsPlayer? = null // 100ms HLS Player
  private var hmssdkInstance: HMSSDK? = null

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
