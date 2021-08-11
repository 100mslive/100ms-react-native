package com.reactnativehmssdk

import android.graphics.Color
import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HmssdkViewManager : SimpleViewManager<View>() {
  override fun getName(): String {
    return REACT_CLASS
  }

  public override fun createViewInstance(reactContext: ThemedReactContext): View {
    return View(reactContext)
  }

  @ReactProp(name = "color")
  fun setColor(view: View, color: String?) {
    view.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val REACT_CLASS = "HmssdkView"
  }
}
