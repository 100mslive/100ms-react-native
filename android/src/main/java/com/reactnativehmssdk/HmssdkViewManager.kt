package com.reactnativehmssdk

import android.app.ActionBar
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import live.hms.video.media.tracks.HMSVideoTrack
import live.hms.video.sdk.HMSSDK
import org.webrtc.SurfaceViewRenderer
import live.hms.video.utils.SharedEglContext
import org.webrtc.EglBase
import org.webrtc.RendererCommon

class HmssdkViewManager : SimpleViewManager<View>() {

  private var reactContext: ThemedReactContext? = null


  override fun getName(): String {
    return REACT_CLASS
  }

  public override fun createViewInstance(reactContext: ThemedReactContext): SurfaceViewRenderer {
    this.reactContext = reactContext
    val view = SurfaceViewRenderer(reactContext)
    view.setEnableHardwareScaler(true)
    view.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
    view.init(SharedEglContext.context, null)
//    view.layout(0,0,100,100)
    view.setBackgroundColor(0xFF00FF00.toInt())
    val hms = getHms()
    val videoTrack = hms?.getLocalPeer()?.videoTrack as HMSVideoTrack
    videoTrack.addSink(view)
    return view
  }

  private var initializedContextCount = 0

  @ReactProp(name = "trackId")
  fun setColor(view: SurfaceViewRenderer, trackId: String?) {
//    view.setBackgroundColor(0xFFFF000F.toInt())
    val hms = getHms()
    print("HMS instance ${hms}")
    val videoTrack = hms?.getLocalPeer()?.videoTrack as HMSVideoTrack
    println("trackID ${videoTrack}")
    println("Track id")
//    videoTrack.addSink(view)
  }

  private fun getHms(): HMSSDK? {
    val hms = reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
    return hms
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
