package com.reactnativehmssdk

import android.os.Build
import androidx.annotation.NonNull
import androidx.annotation.Nullable
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * HMSSDKViewManager — old-arch (paper) view manager for `<HMSView />`.
 *
 * Phase 1 / 1C-3 of the New Architecture migration. This wrapper is
 * compiled only when the consumer's app uses old architecture. It
 * extends SimpleViewManager and uses the legacy @ReactProp setter
 * mechanism. All logic delegates to HMSSDKViewManagerImpl in src/main/.
 */
class HMSSDKViewManager : SimpleViewManager<HMSView>() {
  private var reactContext: ThemedReactContext? = null

  override fun getName(): String = HMSSDKViewManagerImpl.REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): HMSView {
    this.reactContext = reactContext
    return HMSSDKViewManagerImpl.createViewInstance(reactContext)
  }

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> =
    HMSSDKViewManagerImpl.getExportedCustomBubblingEventTypeConstants()

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    HMSSDKViewManagerImpl.getExportedCustomDirectEventTypeConstants()

  @RequiresApi(Build.VERSION_CODES.N)
  override fun receiveCommand(
    @NonNull root: HMSView,
    commandId: String?,
    args: ReadableArray?,
  ) {
    when (commandId) {
      "capture" -> HMSSDKViewManagerImpl.capture(root, args)
    }
  }

  @RequiresApi(Build.VERSION_CODES.N)
  override fun receiveCommand(
    @NonNull root: HMSView,
    commandId: Int,
    args: ReadableArray?,
  ) {
    when (commandId) {
      1 -> HMSSDKViewManagerImpl.capture(root, args)
    }
  }

  @Nullable
  override fun getCommandsMap(): Map<String, Int>? = HMSSDKViewManagerImpl.getCommandsMap()

  @ReactProp(name = "data")
  fun setData(
    view: HMSView,
    data: ReadableMap,
  ) = HMSSDKViewManagerImpl.setData(view, data, reactContext)

  @ReactProp(name = "scaleType")
  fun setScaleType(
    view: HMSView,
    data: String?,
  ) = HMSSDKViewManagerImpl.setScaleType(view, data)

  @ReactProp(name = "setZOrderMediaOverlay")
  fun setZOrderMediaOverlay(
    view: HMSView,
    data: Boolean?,
  ) = HMSSDKViewManagerImpl.setZOrderMediaOverlay(view, data)

  @ReactProp(name = "autoSimulcast")
  fun setAutoSimulcast(
    view: HMSView,
    data: Boolean?,
  ) = HMSSDKViewManagerImpl.setAutoSimulcast(view, data)
}
