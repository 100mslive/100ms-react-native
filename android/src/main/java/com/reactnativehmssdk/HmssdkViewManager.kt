package com.reactnativehmssdk

import android.app.ActionBar
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import live.hms.video.sdk.HMSSDK
import org.webrtc.SurfaceViewRenderer
import live.hms.video.utils.SharedEglContext
import org.webrtc.EglBase

class HmssdkViewManager : SimpleViewManager<SurfaceViewRenderer>() {

  private var reactContext: ThemedReactContext? = null

  override fun getName(): String {
    return REACT_CLASS
  }

  public override fun createViewInstance(reactContext: ThemedReactContext): SurfaceViewRenderer {
    val view = SurfaceViewRenderer(reactContext)
    val layoutParams = view.layoutParams
    layoutParams.width = ViewGroup.LayoutParams.MATCH_PARENT
    layoutParams.height = ViewGroup.LayoutParams.MATCH_PARENT
    view.layoutParams = layoutParams
    return view
  }

  private var initializedContextCount = 0

  @ReactProp(name = "trackId")
  fun setColor(view: SurfaceViewRenderer, trackId: String?) {
    val hms = getHms()
    view.apply {
      View.VISIBLE
      val context:EglBase.Context = SharedEglContext.context

      init(context, null)
      ++initializedContextCount

      hms?.getLocalPeer()?.videoTrack?.addSink(this)
    }
  }

  private fun getHms(): HMSSDK? {
    return reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
