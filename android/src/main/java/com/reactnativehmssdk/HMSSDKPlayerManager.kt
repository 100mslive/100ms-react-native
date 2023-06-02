package com.reactnativehmssdk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HMSSDKPlayerManager : SimpleViewManager<HMSPlayer>() {
  private var reactContext: ThemedReactContext? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun createViewInstance(reactContext: ThemedReactContext): HMSPlayer {
    this.reactContext = reactContext
    return HMSPlayer(reactContext)
  }

  override fun onDropViewInstance(view: HMSPlayer) {
    super.onDropViewInstance(view)
    view.cleanup()
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
    super.getExportedCustomDirectEventTypeConstants()

    return MapBuilder.of(
      HMSPlayerConstants.HMS_HLS_PLAYBACK_EVENT,
      MapBuilder.of("registrationName", "onHmsHlsPlaybackEvent"),
      HMSPlayerConstants.HMS_HLS_STATS_EVENT,
      MapBuilder.of("registrationName", "onHmsHlsStatsEvent"),
    )
  }

  @ReactProp(name = "url")
  fun setStreamURL(view: HMSPlayer, data: String?) {
    view.play(data)
  }

  @ReactProp(name = "enableStats", defaultBoolean = false)
  fun setEnableStats(view: HMSPlayer, data: Boolean) {
    view.enableStats(data)
  }

  @ReactProp(name = "enableControls", defaultBoolean = false)
  fun setEnableControls(view: HMSPlayer, data: Boolean) {
    view.enableControls(data)
  }

  companion object {
    const val REACT_CLASS = "HMSPlayer"
  }
}
