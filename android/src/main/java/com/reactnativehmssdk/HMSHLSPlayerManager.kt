package com.reactnativehmssdk

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

  @ReactProp(name = "url")
  fun setStreamURL(view: HMSHLSPlayer, data: String?) {
    view.play(data)
  }

  @ReactProp(name = "enableStats", defaultBoolean = false)
  fun setEnableStats(view: HMSHLSPlayer, data: Boolean) {
    view.enableStats(data)
  }

  @ReactProp(name = "enableControls", defaultBoolean = false)
  fun setEnableControls(view: HMSHLSPlayer, data: Boolean) {
    view.enableControls(data)
  }

  companion object {
    const val REACT_CLASS = "HMSHLSPlayer"
  }
}
