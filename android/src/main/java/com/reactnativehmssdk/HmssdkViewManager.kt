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

class HmssdkViewManager : SimpleViewManager<SurfaceViewRenderer>() {

  private var reactContext: ThemedReactContext? = null
  private var trackID: String? = null
  private var visible: Boolean = true

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
    return view
  }

  @ReactProp(name = "trackId")
  fun setColor(view: SurfaceViewRenderer, trackId: String?) {
    print("**setTrack")
    trackID=trackId;
    val hms = getHms()
    val localTrackId = hms?.getLocalPeer()?.videoTrack?.trackId
    if (localTrackId == trackId) {
      val videoTrack = hms?.getLocalPeer()?.videoTrack
      if(visible){
      videoTrack?.addSink(view)
      }
      else{
        videoTrack?.removeSink(view)
      }
    }

    val remotePeers = hms?.getRemotePeers()

    if (remotePeers !== null) {
      for (peer in remotePeers) {
        val videoTrackId = peer.videoTrack?.trackId
        if (videoTrackId == trackId) {
          val videoTrack = peer.videoTrack
          if(visible) {
            videoTrack?.addSink(view)
          }else{
            videoTrack?.removeSink(view)
          }
          return
        }
      }
    }
  }

  @ReactProp(name = "sink")
  fun setSink(view: SurfaceViewRenderer, sink: Boolean?) {
    print("**setSink")
    val hms = getHms()
    visible = if (sink !== null) {
      sink
    } else {
      true
    }
    val localTrackId = hms?.getLocalPeer()?.videoTrack?.trackId
    if (localTrackId == trackID) {
      val videoTrack = hms?.getLocalPeer()?.videoTrack
      if(visible) {
        videoTrack?.addSink(view)
      }else{
        videoTrack?.removeSink(view)
      }
    }

    val remotePeers = hms?.getRemotePeers()
    if (remotePeers !== null) {
      for (peer in remotePeers) {
        val videoTrackId = peer.videoTrack?.trackId
        if (videoTrackId == trackID) {
          val videoTrack = peer.videoTrack
          if(visible) {
            videoTrack?.addSink(view)
          }else{
            videoTrack?.removeSink(view)
          }
          return
        }
      }
    }
  }

  private fun getHms(): HMSSDK? {
    val hms = reactContext?.getNativeModule(HmsModule::class.java)?.getHmsInstance()
    return hms
  }

  companion object {
    const val REACT_CLASS = "HmsView"
  }
}
