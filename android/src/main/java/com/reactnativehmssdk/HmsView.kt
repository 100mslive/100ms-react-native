package com.reactnativehmssdk

import android.content.Context
import android.widget.FrameLayout
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import live.hms.video.sdk.HMSSDK
import org.webrtc.SurfaceViewRenderer
import live.hms.video.utils.SharedEglContext
import org.webrtc.RendererCommon

class HmsView(
  context: ReactContext
) : FrameLayout(context) {
  private var surfaceView: SurfaceViewRenderer
  private var sinked = false
  private var localTrack: String? = null
  private var hmsRef: HMSSDK? = null
  private var attached: Boolean = false

  init {
    surfaceView = SurfaceViewRenderer(context)
    surfaceView.setEnableHardwareScaler(true)
    surfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
    addView(surfaceView)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    attached = false
    if (sinked) {
      val localTrackId = hmsRef?.getLocalPeer()?.videoTrack?.trackId
      if (localTrackId == localTrack) {
        val videoTrack = hmsRef?.getLocalPeer()?.videoTrack

        videoTrack?.removeSink(surfaceView)
        surfaceView.release()
        sinked = false
        return
      }

      val remotePeers = hmsRef?.getRemotePeers()

      if (remotePeers !== null) {
        for (peer in remotePeers) {
          val videoTrackId = peer.videoTrack?.trackId
          if (videoTrackId == localTrack) {
            val videoTrack = peer.videoTrack
            videoTrack?.removeSink(surfaceView)
            sinked = false
            surfaceView.release()
            return
          }
        }
      }
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    attached = true
    if (!sinked) {
      val localTrackId = hmsRef?.getLocalPeer()?.videoTrack?.trackId
      if (localTrackId == localTrack) {
        val videoTrack = hmsRef?.getLocalPeer()?.videoTrack
        surfaceView.init(SharedEglContext.context, null)
        videoTrack?.addSink(surfaceView)
        sinked = true
        return
      }

      val remotePeers = hmsRef?.getRemotePeers()

      if (remotePeers !== null) {
        for (peer in remotePeers) {
          val videoTrackId = peer.videoTrack?.trackId
          if (videoTrackId == localTrack) {
            val videoTrack = peer.videoTrack
            surfaceView.init(SharedEglContext.context, null)
            videoTrack?.addSink(surfaceView)
            sinked = true
            return
          }
        }
      }
    }
  }

  fun setData(trackId: String?, sink: Boolean?, hms: HMSSDK?) {
    hmsRef = hms
    if (trackId != null) {
      localTrack = trackId
      if (attached) {
        val localTrackId = hms?.getLocalPeer()?.videoTrack?.trackId
        if (localTrackId == localTrack) {
          val videoTrack = hms?.getLocalPeer()?.videoTrack
          if(!sinked) {
            surfaceView.init(SharedEglContext.context, null)
            videoTrack?.addSink(surfaceView)
            sinked = true
          }
        }

        val remotePeers = hms?.getRemotePeers()

        if (remotePeers !== null) {
          for (peer in remotePeers) {
            val videoTrackId = peer.videoTrack?.trackId
            if (videoTrackId == localTrack) {
              val videoTrack = peer.videoTrack
              if(!sinked) {
                surfaceView.init(SharedEglContext.context, null)
                videoTrack?.addSink(surfaceView)
                println("****addSinkremote")
                sinked = true
              }
              return
            }
          }
        }
      }
    }
  }
}

