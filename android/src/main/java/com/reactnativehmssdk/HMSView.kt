package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlinx.coroutines.*
import live.hms.video.media.tracks.HMSVideoTrack
import live.hms.video.utils.HmsUtilities
import live.hms.videoview.HMSVideoView
import live.hms.videoview.VideoViewStateChangeListener
import org.webrtc.RendererCommon

@SuppressLint("ViewConstructor")
class HMSView(context: ReactContext) : FrameLayout(context) {
  private var hmsVideoView: HMSVideoView? = null
  private var videoTrack: HMSVideoTrack? = null
  private var scaleTypeApplied: Boolean = false
  private var sdkId: String = "12345"
  private var disableAutoSimulcastLayerSelect = false
  var view: View? = null

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    view = inflater.inflate(R.layout.hms_view, this)

    hmsVideoView = view!!.findViewById(R.id.hmsVideoView)
    hmsVideoView?.setEnableHardwareScaler(false)

    hmsVideoView?.setMirror(false)
    hmsVideoView?.disableAutoSimulcastLayerSelect(disableAutoSimulcastLayerSelect)

    hmsVideoView?.addVideoViewStateChangeListener(object : VideoViewStateChangeListener {
      override fun onResolutionChange(newWidth: Int, newHeight: Int) {
        super.onResolutionChange(newWidth, newHeight)
        Log.i("HMSView", "hmsVideoView resolution changed, newWidth = $newWidth, newHeight = $newHeight")
        Log.i("HMSView", "old width -> ${hmsVideoView?.width}")
        Log.i("HMSView", "old height -> ${hmsVideoView?.height}")

        val event: WritableMap = Arguments.createMap()
        context.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "topChange", event)

//        val width = hmsVideoView.width
//        val height = hmsVideoView.height
//        val aspectRatio = newWidth / newHeight
//        if (width >= height) {
//          hmsVideoView.layoutParams.width = height * aspectRatio
//        } else {
//          hmsVideoView.layoutParams.height = width / aspectRatio
//        }
//        Log.i("HMSView", "new width -> ${hmsVideoView.width}")
//        Log.i("HMSView", "new height -> ${hmsVideoView.height}")
      }

      override fun onFirstFrameRendered() {
        super.onFirstFrameRendered()
        Log.i("HMSView", "hmsVideoView First Frame Rendered")
      }
    })
  }

  @RequiresApi(Build.VERSION_CODES.N)
  fun captureHmsView(args: ReadableArray?) {
//    hmsVideoView?.let {
//      HMSHelper.captureSurfaceView(it, sdkId, args, context, id)
//    }
//
  }

  private fun onReceiveNativeEvent() {
    val event: WritableMap = Arguments.createMap()
    event.putString("message", "MyMessage")
    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "topChange", event)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    Log.i("HMSView", "width -> ${hmsVideoView?.width}")
    Log.i("HMSView", "height -> ${hmsVideoView?.height}")

//    view!!.layoutParams.width = FrameLayout.LayoutParams.WRAP_CONTENT
//    view!!.layoutParams.height = FrameLayout.LayoutParams.WRAP_CONTENT

//    hmsVideoView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL)
  }

  fun updateZOrderMediaOverlay(setZOrderMediaOverlay: Boolean?) {
//    if (setZOrderMediaOverlay != null && setZOrderMediaOverlay) {
//      // hmsVideoView.setZOrderOnTop(true);
//      hmsVideoView.setZOrderMediaOverlay(setZOrderMediaOverlay)
//    }
  }

  fun updateScaleType(scaleType: String?) {
  }

  fun setData(
    id: String?,
    trackId: String?,
    hmsCollection: MutableMap<String, HMSRNSDK>,
    mirror: Boolean?,
    scaleType: String?,
  ) {
    if (id != null) {
      sdkId = id
    }
    val hms = hmsCollection[sdkId]?.hmsSDK

    if (trackId != null && hms != null) {
      if (mirror != null) {
        hmsVideoView?.setMirror(mirror)
      }
      Log.i("HMSView", "width inside setData fn before adding track -> ${hmsVideoView?.width}")
      Log.i("HMSView", "height inside setData fn before adding track -> ${hmsVideoView?.height}")

      val videoTrack = hms.getRoom()?.let { HmsUtilities.getVideoTrack(trackId, it) }

      videoTrack?.let {
        hmsVideoView?.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
        hmsVideoView?.addTrack(it)

//        hmsVideoView.layoutParams.width = 300 * 3
//        hmsVideoView.layoutParams.height = 169 * 3
      } ?: run {
        Log.e(
          "HMSView",
          "HMSView attached to window, but it's videoTrack is null",
        )
      }

      Log.i("HMSView", "width inside setData fn after adding track -> ${hmsVideoView?.width}")
      Log.i("HMSView", "height inside setData fn after adding track -> ${hmsVideoView?.height}")
    }
  }

  fun updateAutoSimulcast(autoSimulcast: Boolean?) {
    autoSimulcast?.let {
      hmsVideoView?.disableAutoSimulcastLayerSelect(!it)
    }
  }
}
