package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.widget.FrameLayout
import android.content.Context
import android.view.LayoutInflater
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import live.hms.video.media.tracks.HMSTrackType
import live.hms.video.media.tracks.HMSVideoTrack
import live.hms.video.utils.SharedEglContext
import org.webrtc.RendererCommon
import org.webrtc.SurfaceViewRenderer
import com.facebook.react.uimanager.events.RCTEventEmitter

import com.facebook.react.bridge.WritableMap

@SuppressLint("ViewConstructor")
class HmsView(context: ReactContext) : FrameLayout(context) {
  private var surfaceView: SurfaceViewRenderer = SurfaceViewRenderer(context)
  private var videoTrack: HMSVideoTrack? = null
  private var localTrack: String? = null
  private var scaleTypeApplied: Boolean = false
  private var currentScaleType: RendererCommon.ScalingType = RendererCommon.ScalingType.SCALE_ASPECT_FILL

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    val view = inflater.inflate(R.layout.hms_view, this)

    surfaceView = view.findViewById(R.id.surfaceView)
    surfaceView.setEnableHardwareScaler(true)
  }

  fun onReceiveNativeEvent() {
    val event: WritableMap = Arguments.createMap()
    event.putString("message", "MyMessage")
    val reactContext = context as ReactContext
    reactContext
      .getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "topChange", event)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
      videoTrack?.removeSink(surfaceView)
      surfaceView.release()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    surfaceView.init(SharedEglContext.context, null)
    videoTrack?.addSink(surfaceView)
    if (!scaleTypeApplied) {
      if (currentScaleType != RendererCommon.ScalingType.SCALE_ASPECT_FILL) {
        onReceiveNativeEvent()
      }
      scaleTypeApplied = true
    }
  }

  fun updateScaleType(scaleType: String?) {
    if (scaleType != null) {
      when (scaleType) {
        "ASPECT_FIT" -> {
          surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
          currentScaleType = RendererCommon.ScalingType.SCALE_ASPECT_FIT
          return
        }
        "ASPECT_FILL" -> {
          surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL)
          currentScaleType = RendererCommon.ScalingType.SCALE_ASPECT_FILL
          return
        }
        "ASPECT_BALANCED" -> {
          surfaceView.setScalingType((RendererCommon.ScalingType.SCALE_ASPECT_BALANCED))
          currentScaleType = RendererCommon.ScalingType.SCALE_ASPECT_BALANCED
          return
        }
        else -> {
          return
        }
      }
    }
  }

  fun setData(
      id: String?,
      trackId: String?,
      hmsCollection: MutableMap<String, HmsSDK>,
      mirror: Boolean?
  ) {
    var sdkId = "12345"
    if (id != null) {
      sdkId = id
    }

    val hms = hmsCollection[sdkId]?.hmsSDK

    if (trackId != null && hms != null) {
      if (mirror != null) {
        surfaceView.setMirror(mirror)
      }
      localTrack = trackId
      val localTrackId = hms.getLocalPeer()?.videoTrack?.trackId
      if (localTrackId == localTrack) {
        videoTrack = hms.getLocalPeer()?.videoTrack
      }

      val remotePeers = hms.getRemotePeers()
      for (peer in remotePeers) {
        val videoTrackId = peer.videoTrack?.trackId

        val auxiliaryTracks = peer.auxiliaryTracks
        for (track in auxiliaryTracks) {
          val auxTrackId = track.trackId
          if (trackId == auxTrackId && track.type == HMSTrackType.VIDEO && !track.isMute) {
            videoTrack = track as HMSVideoTrack
            return
          }
        }
        if (videoTrackId == localTrack) {
          videoTrack = peer.videoTrack
          return
        }
      }
    }
  }
}
