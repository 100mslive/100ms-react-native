package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HMSHLSPlayerManager : SimpleViewManager<HMSHLSPlayer>() {
  private var reactContext: ThemedReactContext? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): HMSHLSPlayer {
    this.reactContext = reactContext
    return HMSHLSPlayer(reactContext)
  }

  override fun onDropViewInstance(view: HMSHLSPlayer) {
    super.onDropViewInstance(view)
    view.cleanup()
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
    super.getExportedCustomDirectEventTypeConstants()

    return MapBuilder.of(
      HMSHLSPlayerConstants.HMS_HLS_PLAYBACK_EVENT,
      MapBuilder.of("registrationName", "onHmsHlsPlaybackEvent"),
      HMSHLSPlayerConstants.HMS_HLS_STATS_EVENT,
      MapBuilder.of("registrationName", "onHmsHlsStatsEvent"),
    )
  }

  override fun receiveCommand(
    root: HMSHLSPlayer,
    commandId: Int,
    args: ReadableArray?,
  ) {
    super.receiveCommand(root, commandId, args)

    when (commandId) {
      10 -> root.play(args?.getString(0))
      20 -> root.stop()
      30 -> root.pause()
      40 -> root.resume()
      50 -> root.seekToLivePosition()
      60 -> {
        args.let {
          if (it != null) {
            root.seekForward(it.getDouble(0))
          }
        }
      }
      70 -> {
        args.let {
          if (it != null) {
            root.seekBackward(it.getDouble(0))
          }
        }
      }
      80 -> {
        args.let {
          if (it != null) {
            root.setVolume(it.getInt(0))
          }
        }
      }
    }
  }

  override fun getCommandsMap(): MutableMap<String, Int>? {
    return MapBuilder.builder<String, Int>()
      .put("play", 10)
      .put("stop", 20)
      .put("pause", 30)
      .put("resume", 40)
      .put("seekToLivePosition", 50)
      .put("seekForward", 60)
      .put("seekBackward", 70)
      .put("setVolume", 80)
      .build()
  }

  @ReactProp(name = "url")
  fun setStreamURL(
    view: HMSHLSPlayer,
    data: String?,
  ) {
    view.play(data)
  }

  @ReactProp(name = "enableStats", defaultBoolean = false)
  fun setEnableStats(
    view: HMSHLSPlayer,
    data: Boolean,
  ) {
    view.enableStats(data)
  }

  @ReactProp(name = "enableControls", defaultBoolean = false)
  fun setEnableControls(
    view: HMSHLSPlayer,
    data: Boolean,
  ) {
    view.enableControls(data)
  }

  companion object {
    const val REACT_CLASS = "HMSHLSPlayer"
  }
}
