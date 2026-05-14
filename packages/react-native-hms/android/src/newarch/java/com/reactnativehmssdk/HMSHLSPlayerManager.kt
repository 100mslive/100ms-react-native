package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.HMSHLSPlayerManagerDelegate
import com.facebook.react.viewmanagers.HMSHLSPlayerManagerInterface

/**
 * HMSHLSPlayerManager — new-arch (Fabric) view manager for `<HMSHLSPlayer />`.
 *
 * Phase 1 / 1C-4 of the New Architecture migration. Compiled only when
 * the consumer's app uses new architecture.
 *
 * Differences from the old-arch wrapper:
 *   - Implements the Codegen-generated `HMSHLSPlayerManagerInterface<HMSHLSPlayer>`
 *     (typed prop setters AND typed command methods that Fabric calls directly).
 *   - Uses `HMSHLSPlayerManagerDelegate` for prop dispatch via Fabric's
 *     mounting mechanism.
 *   - Drops @ReactProp annotations — Fabric doesn't scan for them.
 *   - Implements receiveCommand(commandName: String, args) for Fabric's
 *     string-based command dispatch (in addition to numeric Int dispatch
 *     via the typed command methods).
 *
 * All logic delegates to HMSHLSPlayerManagerImpl in src/main/.
 */
class HMSHLSPlayerManager :
  SimpleViewManager<HMSHLSPlayer>(),
  HMSHLSPlayerManagerInterface<HMSHLSPlayer> {
  private val mDelegate: ViewManagerDelegate<HMSHLSPlayer> = HMSHLSPlayerManagerDelegate(this)

  override fun getName(): String = HMSHLSPlayerManagerImpl.REACT_CLASS

  override fun getDelegate(): ViewManagerDelegate<HMSHLSPlayer> = mDelegate

  override fun createViewInstance(reactContext: ThemedReactContext): HMSHLSPlayer =
    HMSHLSPlayerManagerImpl.createViewInstance(reactContext)

  override fun onDropViewInstance(view: HMSHLSPlayer) {
    super.onDropViewInstance(view)
    HMSHLSPlayerManagerImpl.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    HMSHLSPlayerManagerImpl.getExportedCustomDirectEventTypeConstants()

  /** Fabric command dispatch by string name (Codegen routes here via the delegate). */
  override fun receiveCommand(
    root: HMSHLSPlayer,
    commandId: String?,
    args: ReadableArray?,
  ) {
    if (commandId != null) {
      HMSHLSPlayerManagerImpl.receiveCommandByName(root, commandId, args)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Codegen-interface methods — typed prop setters
  // ─────────────────────────────────────────────────────────────────

  override fun setUrl(
    view: HMSHLSPlayer,
    value: String?,
  ) = HMSHLSPlayerManagerImpl.setUrl(view, value)

  override fun setEnableStats(
    view: HMSHLSPlayer,
    value: Boolean,
  ) = HMSHLSPlayerManagerImpl.setEnableStats(view, value)

  override fun setEnableControls(
    view: HMSHLSPlayer,
    value: Boolean,
  ) = HMSHLSPlayerManagerImpl.setEnableControls(view, value)

  // ─────────────────────────────────────────────────────────────────
  // Codegen-interface methods — typed imperative commands (13)
  // ─────────────────────────────────────────────────────────────────

  override fun play(
    view: HMSHLSPlayer,
    url: String?,
  ) = HMSHLSPlayerManagerImpl.play(view, url)

  override fun stop(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.stop(view)

  override fun pause(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.pause(view)

  override fun resume(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.resume(view)

  override fun seekToLivePosition(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.seekToLivePosition(view)

  override fun seekForward(
    view: HMSHLSPlayer,
    seconds: Double,
  ) = HMSHLSPlayerManagerImpl.seekForward(view, seconds)

  override fun seekBackward(
    view: HMSHLSPlayer,
    seconds: Double,
  ) = HMSHLSPlayerManagerImpl.seekBackward(view, seconds)

  override fun setVolume(
    view: HMSHLSPlayer,
    level: Int,
  ) = HMSHLSPlayerManagerImpl.setVolume(view, level)

  override fun areClosedCaptionSupported(
    view: HMSHLSPlayer,
    requestId: Int,
  ) = HMSHLSPlayerManagerImpl.areClosedCaptionSupported(view, requestId)

  override fun isClosedCaptionEnabled(
    view: HMSHLSPlayer,
    requestId: Int,
  ) = HMSHLSPlayerManagerImpl.isClosedCaptionEnabled(view, requestId)

  override fun enableClosedCaption(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.enableClosedCaption(view)

  override fun disableClosedCaption(view: HMSHLSPlayer) = HMSHLSPlayerManagerImpl.disableClosedCaption(view)

  override fun getPlayerDurationDetails(
    view: HMSHLSPlayer,
    requestId: Int,
  ) = HMSHLSPlayerManagerImpl.getPlayerDurationDetails(view, requestId)
}
