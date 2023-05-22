package com.reactnativehmssdk

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

  @ReactProp(name = "url")
  fun setStreamURL(view: HMSPlayer, data: String?) {
    view.play(data)
  }

  companion object {
    const val REACT_CLASS = "HMSPlayer"
  }
}
