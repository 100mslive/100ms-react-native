package com.reactnativehmssdk

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

  public override fun createViewInstance(reactContext: ThemedReactContext): HmsView {
    this.reactContext = reactContext
    val view = HmsView(reactContext)
    return view
  }

  @ReactProp(name = "trackId")
  fun setTrackId(view: HmsView, trackId: String?) {
    val hms = getHms()

    view.setTrackId(trackId, hms)
  }

  @ReactProp(name = "sink")
  fun setSink(view: HmsView, sink: Boolean?) {
    val hms = getHms()
    view.setSink(sink, hms)
  }

  private fun getHms(): HMSSDK? {
    val hms = reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
    return hms
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
