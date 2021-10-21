package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import live.hms.video.sdk.HMSSDK

class HmssdkViewManager : SimpleViewManager<HmsView>() {

  private var reactContext: ThemedReactContext? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  override fun onDropViewInstance(view: HmsView) {
    super.onDropViewInstance(view)
  }

  public override fun createViewInstance(reactContext: ThemedReactContext): HmsView {
    this.reactContext = reactContext
    val view = HmsView(reactContext)
    return view
  }

  @ReactProp(name = "data")
  fun setData(view: HmsView, data: ReadableMap) {
    val trackId = data.getString("trackId")
    val sink = data.getBoolean("sink")

    val hms = getHms()
    view.setData(trackId, sink, hms)
    // do the processing here
  }

  @ReactProp(name = "scaleType")
  fun setScaleType(view: HmsView, data: String?) {
    view.updateScaleType(data)
  }

  private fun getHms(): HMSSDK? {
    val hms = reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
    return hms
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
