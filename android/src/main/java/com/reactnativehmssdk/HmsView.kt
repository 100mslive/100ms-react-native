package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import live.hms.video.media.tracks.HMSTrackType
import live.hms.video.media.tracks.HMSVideoTrack
import live.hms.video.utils.SharedEglContext
import org.webrtc.RendererCommon
import org.webrtc.SurfaceViewRenderer

@SuppressLint("ViewConstructor")
class HmsView(context: ReactContext) : FrameLayout(context) {
  private var surfaceView: SurfaceViewRenderer = SurfaceViewRenderer(context)
  private var videoTrack: HMSVideoTrack? = null
  private var localTrack: String? = null

  init {
    surfaceView.setEnableHardwareScaler(true)
    surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
    addView(surfaceView)
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
  }

  fun updateScaleType(scaleType: String?) {
    if (scaleType != null) {
      when (scaleType) {
        "ASPECT_FIT" -> {
          surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
          return
        }
        "ASPECT_FILL" -> {
          surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL)
          return
        }
        "ASPECT_BALANCED" -> {
          surfaceView.setScalingType((RendererCommon.ScalingType.SCALE_ASPECT_BALANCED))
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
