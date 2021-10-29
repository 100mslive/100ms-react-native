package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import live.hms.video.sdk.HMSSDK
import org.webrtc.SurfaceViewRenderer
import live.hms.video.utils.SharedEglContext
import org.webrtc.RendererCommon

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

  @ReactProp(name="data")
  fun setData(view: HmsView, data: ReadableMap) {
    val trackId = data.getString("trackId")
    val sink = data.getBoolean("sink")
    val id = data.getString("id")

    val hmsCollection = getHms()
    if (hmsCollection != null) {
      view.setData(id, trackId, sink, hmsCollection)
    }
    // do the processing here
  }

  @ReactProp(name="scaleType")
  fun setScaleType(view: HmsView, data: String?) {
    view.updateScaleType(data)
  }

  private fun getHms(): MutableMap<String, HmsSDK>? {
    val hmsCollection = reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
    return hmsCollection
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
