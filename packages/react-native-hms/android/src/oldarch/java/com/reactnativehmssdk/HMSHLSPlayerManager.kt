package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * HMSHLSPlayerManager — old-arch (paper) view manager for `<HMSHLSPlayer />`.
 *
 * Phase 1 / 1C-4 of the New Architecture migration. Compiled only when
 * the consumer's app uses old architecture. All logic delegates to
 * HMSHLSPlayerManagerImpl in src/main/.
 */
class HMSHLSPlayerManager : SimpleViewManager<HMSHLSPlayer>() {
  override fun getName(): String = HMSHLSPlayerManagerImpl.REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): HMSHLSPlayer =
    HMSHLSPlayerManagerImpl.createViewInstance(reactContext)

  override fun onDropViewInstance(view: HMSHLSPlayer) {
    super.onDropViewInstance(view)
    HMSHLSPlayerManagerImpl.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    HMSHLSPlayerManagerImpl.getExportedCustomDirectEventTypeConstants()

  override fun receiveCommand(
    root: HMSHLSPlayer,
    commandId: Int,
    args: ReadableArray?,
  ) {
    super.receiveCommand(root, commandId, args)
    HMSHLSPlayerManagerImpl.receiveCommandById(root, commandId, args)
  }

  override fun getCommandsMap(): Map<String, Int> = HMSHLSPlayerManagerImpl.getCommandsMap()

  // ─────────────────────────────────────────────────────────────────
  // Paper @ReactProp setters
  // ─────────────────────────────────────────────────────────────────

  @ReactProp(name = "url")
  fun setStreamURL(
    view: HMSHLSPlayer,
    data: String?,
  ) = HMSHLSPlayerManagerImpl.setUrl(view, data)

  @ReactProp(name = "enableStats", defaultBoolean = false)
  fun setEnableStats(
    view: HMSHLSPlayer,
    data: Boolean,
  ) = HMSHLSPlayerManagerImpl.setEnableStats(view, data)

  @ReactProp(name = "enableControls", defaultBoolean = false)
  fun setEnableControls(
    view: HMSHLSPlayer,
    data: Boolean,
  ) = HMSHLSPlayerManagerImpl.setEnableControls(view, data)
}
