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

  public override fun createViewInstance(reactContext: ThemedReactContext): HMSPlayer {
    this.reactContext = reactContext
    return HMSPlayer(reactContext)
  }

  private fun getHms(): MutableMap<String, HMSRNSDK>? {
    return reactContext?.getNativeModule(HMSManager::class.java)?.getHmsInstance()
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

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return super.getExportedCustomBubblingEventTypeConstants()
  }

  override fun onDropViewInstance(view: HMSPlayer) {
    super.onDropViewInstance(view)
    view.cleanup()
  }

  @ReactProp(name = "url")
  fun setStreamURL(view: HMSPlayer, data: String?) {
    view.play(data)
  }

  companion object {
    const val REACT_CLASS = "HMSPlayer"
  }
}
