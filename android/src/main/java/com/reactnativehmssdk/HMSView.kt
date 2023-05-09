package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import live.hms.video.media.tracks.HMSVideoTrack
import live.hms.video.utils.HmsUtilities
import live.hms.videoview.HMSVideoView
import org.webrtc.RendererCommon

@SuppressLint("ViewConstructor")
class HMSView(context: ReactContext) : FrameLayout(context) {
  private var hmsVideoView: HMSVideoView = HMSVideoView(context)
  private var videoTrack: HMSVideoTrack? = null
  private var scaleTypeApplied: Boolean = false
  private var sdkId: String = "12345"
  private var currentScaleType: RendererCommon.ScalingType =
    RendererCommon.ScalingType.SCALE_ASPECT_FILL
  private var disableAutoSimulcastLayerSelect = false

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    val view = inflater.inflate(R.layout.hms_view, this)

    hmsVideoView = view.findViewById(R.id.hmsVideoView)
    hmsVideoView.setEnableHardwareScaler(false)
    hmsVideoView.setScalingType(currentScaleType)
    hmsVideoView.setMirror(false)
    hmsVideoView.disableAutoSimulcastLayerSelect(disableAutoSimulcastLayerSelect)
  }

  @RequiresApi(Build.VERSION_CODES.N)
  fun captureHmsView(args: ReadableArray?) {
    HMSHelper.captureSurfaceView(hmsVideoView, sdkId, args, context, id)
  }

  private fun onReceiveNativeEvent() {
    val event: WritableMap = Arguments.createMap()
    event.putString("message", "MyMessage")
    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "topChange", event)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    hmsVideoView.removeTrack()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    videoTrack?.let { // Safe Call Operator to check if videoTrack is not null
      hmsVideoView.addTrack(it) // add the videoTrack to the hmsVideoView
      if (!scaleTypeApplied) { // check if the scaleTypeApplied flag is false
        if (currentScaleType != RendererCommon.ScalingType.SCALE_ASPECT_FILL) { // check if the currentScaleType is not SCALE_ASPECT_FILL
          onReceiveNativeEvent() // call the onReceiveNativeEvent function
        }
        scaleTypeApplied = true // set the scaleTypeApplied flag to true
      }
    } ?: run { // Elvis Operator to handle the case when videoTrack is null
      Log.e(
        "HMSView",
        "HMSView attached to window, but it's videoTrack is null",
      ) // log an error message
    }
  }

  fun updateZOrderMediaOverlay(setZOrderMediaOverlay: Boolean?) {
    if (setZOrderMediaOverlay != null && setZOrderMediaOverlay) {
      // hmsVideoView.setZOrderOnTop(true);
      hmsVideoView.setZOrderMediaOverlay(setZOrderMediaOverlay)
    }
  }

  fun updateScaleType(scaleType: String?) {
    if (scaleType != null) {
      when (scaleType) {
        "ASPECT_FIT" -> {
          hmsVideoView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
          currentScaleType = RendererCommon.ScalingType.SCALE_ASPECT_FIT
          return
        }
        "ASPECT_FILL" -> {
          hmsVideoView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL)
          currentScaleType = RendererCommon.ScalingType.SCALE_ASPECT_FILL
          return
        }
        "ASPECT_BALANCED" -> {
          hmsVideoView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_BALANCED)
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
    hmsCollection: MutableMap<String, HMSRNSDK>,
    mirror: Boolean?,
  ) {
    if (id != null) {
      sdkId = id
    }
    val hms = hmsCollection[sdkId]?.hmsSDK

    if (trackId != null && hms != null) {
      if (mirror != null) {
        hmsVideoView.setMirror(mirror)
      }
      // TODO: can be optimized here
      videoTrack = hms.getRoom()?.let { HmsUtilities.getVideoTrack(trackId, it) }
    }
  }

  fun updateAutoSimulcast(autoSimulcast: Boolean?) {
    autoSimulcast?.let {
      hmsVideoView.disableAutoSimulcastLayerSelect(!it)
    }
  }
}
