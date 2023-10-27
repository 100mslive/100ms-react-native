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
import live.hms.videoview.VideoViewStateChangeListener
import org.webrtc.RendererCommon

@SuppressLint("ViewConstructor")
class HMSView(context: ReactContext) : FrameLayout(context) {
  private var hmsVideoView: HMSVideoView? = null
  private var videoTrack: HMSVideoTrack? = null
  private var sdkId: String = "12345"
  private var disableAutoSimulcastLayerSelect = false
  private var jsCanApplyStyles = false

  init {
    val inflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    val view = inflater.inflate(R.layout.hms_view, this)

    hmsVideoView = view.findViewById(R.id.hmsVideoView)
    hmsVideoView?.setEnableHardwareScaler(false)

    hmsVideoView?.setMirror(false)
    hmsVideoView?.disableAutoSimulcastLayerSelect(disableAutoSimulcastLayerSelect)

    hmsVideoView?.addVideoViewStateChangeListener(
      object : VideoViewStateChangeListener {
        override fun onResolutionChange(
          newWidth: Int,
          newHeight: Int,
        ) {
          super.onResolutionChange(newWidth, newHeight)

          videoTrack?.let { nonnullVideoTrack ->
            // emit when source is screen or `jsCanApplyStyles` is `false`
            if (nonnullVideoTrack.source == "screen" || !jsCanApplyStyles) {
              jsCanApplyStyles = true

              val data = Arguments.createMap()
              data.putInt("width", newWidth)
              data.putInt("height", newHeight)

              sendEventToJS("ON_RESOLUTION_CHANGE_EVENT", data)
            }
          }
        }
      },
    )
  }

  private fun sendEventToJS(
    eventName: String,
    data: WritableMap,
  ) {
    val event: WritableMap = Arguments.createMap()
    event.putString("event", eventName)
    event.putMap("data", data)

    val reactContext = context as ReactContext
    reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, "topChange", event)
  }

  @RequiresApi(Build.VERSION_CODES.N)
  fun captureHmsView(args: ReadableArray?) {
    hmsVideoView?.let {
      HMSHelper.captureSurfaceView(it, sdkId, args, context, id)
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    hmsVideoView?.removeTrack()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    videoTrack?.let { // Safe Call Operator to check if videoTrack is not null
      hmsVideoView?.addTrack(it) // add the videoTrack to the hmsVideoView
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
      hmsVideoView?.setZOrderMediaOverlay(setZOrderMediaOverlay)
    }
  }

  fun updateScaleType(scaleType: String?) {
    if (scaleType != null) {
      when (scaleType) {
        "ASPECT_FIT" -> {
          hmsVideoView?.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
          return
        }
        "ASPECT_FILL" -> {
          hmsVideoView?.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL)
          return
        }
        "ASPECT_BALANCED" -> {
          hmsVideoView?.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_BALANCED)
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
    scaleType: String?,
  ) {
    if (id != null) {
      sdkId = id
    }
    val rnSDK = hmsCollection[sdkId]
    val hms = rnSDK?.hmsSDK

    if (trackId != null && hms != null) {
      if (mirror != null) {
        hmsVideoView?.setMirror(mirror)
      }
      updateScaleType(scaleType)

      hms.getRoom()?.let { room ->
        val regularVideoTrack: HMSVideoTrack? = HmsUtilities.getVideoTrack(trackId, room)

        regularVideoTrack.let { fetchedTrack ->
          if (fetchedTrack == null) {
            rnSDK.previewForRoleVideoTrack?.let {
              if (it.trackId == trackId) {
                videoTrack = it
              }
            }
          } else {
            videoTrack = fetchedTrack
          }
        }
      }
    }
  }

  fun updateAutoSimulcast(autoSimulcast: Boolean?) {
    autoSimulcast?.let {
      hmsVideoView?.disableAutoSimulcastLayerSelect(!it)
    }
  }
}
