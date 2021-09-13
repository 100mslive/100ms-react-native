package com.reactnativehmssdk

import android.content.Context
import android.widget.FrameLayout
import live.hms.video.sdk.HMSSDK
import org.webrtc.SurfaceViewRenderer
import live.hms.video.utils.SharedEglContext
import org.webrtc.RendererCommon

class HmsView(
  context: Context
) : FrameLayout(context) {
  private var surfaceView: SurfaceViewRenderer
  private var sinked = false
  private var localTrack: String? = null
  private var sinkVideo: Boolean = true

  init {
    surfaceView = SurfaceViewRenderer(context)
    surfaceView.setEnableHardwareScaler(true)
    surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
    surfaceView.init(SharedEglContext.context, null)

    addView(surfaceView)
  }

  fun setTrackId(trackId: String?, hms: HMSSDK?) {
    if (trackId != null) {
      localTrack = trackId
      val localTrackId = hms?.getLocalPeer()?.videoTrack?.trackId
      if (localTrackId == trackId) {
        val videoTrack = hms.getLocalPeer()?.videoTrack
        videoTrack?.addSink(surfaceView)
      }

      val remotePeers = hms?.getRemotePeers()

      if (remotePeers !== null) {
        for (peer in remotePeers) {
          val videoTrackId = peer.videoTrack?.trackId

          if (videoTrackId == trackId) {
            val videoTrack = peer.videoTrack

            videoTrack?.addSink(surfaceView)
            sinked = true
            return
          }
        }
      }
    }
  }

  fun setSink(sink: Boolean?, hms: HMSSDK?) {
    if (sink != null && localTrack != null) {
      sinkVideo = sink
      val localTrackId = hms?.getLocalPeer()?.videoTrack?.trackId
      if (localTrackId == localTrack) {
        val videoTrack = hms?.getLocalPeer()?.videoTrack
        videoTrack?.addSink(surfaceView)
      }

      val remotePeers = hms?.getRemotePeers()

      if (remotePeers !== null) {
        for (peer in remotePeers) {
          val videoTrackId = peer.videoTrack?.trackId

          if (videoTrackId == localTrack) {
            val videoTrack = peer.videoTrack

            videoTrack?.addSink(surfaceView)
            return
          }
        }
      }
    }
  }
}
