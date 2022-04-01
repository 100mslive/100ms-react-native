package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HmssdkViewManager : SimpleViewManager<HmsView>() {

  private var reactContext: ThemedReactContext? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  public override fun createViewInstance(reactContext: ThemedReactContext): HmsView {
    this.reactContext = reactContext
    return HmsView(reactContext)
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
        .put(
            "topChange",
            MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onChange"))
        )
        .build()
  }

  @ReactProp(name = "data")
  fun setData(view: HmsView, data: ReadableMap) {
    val trackId = data.getString("trackId")
    //    val sink = data.getBoolean("sink")
    val id = data.getString("id")
    val mirror = data.getBoolean("mirror")
    val hmsCollection = getHms()
    if (hmsCollection != null) {
      view.setData(id, trackId, hmsCollection, mirror)
    }
    // do the processing here
  }

  @ReactProp(name = "scaleType")
  fun setScaleType(view: HmsView, data: String?) {
    view.updateScaleType(data)
  }

  @ReactProp(name = "setZOrderMediaOverlay")
  fun setZOrderMediaOverlay(view: HmsView, data: Boolean?) {
    view.updateZOrderMediaOverlay(data)
  }

  private fun getHms(): MutableMap<String, HmsSDK>? {
    return reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
