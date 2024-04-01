package com.reactnativehmssdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class HMSTrackStatsViewManager(private val callerContext: ReactApplicationContext) : SimpleViewManager<HMSTrackStatsView>() {
  companion object {
    const val REACT_CLASS = "HMSTrackStatsView"
  }

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): HMSTrackStatsView {
    return HMSTrackStatsView(reactContext)
  }
}
