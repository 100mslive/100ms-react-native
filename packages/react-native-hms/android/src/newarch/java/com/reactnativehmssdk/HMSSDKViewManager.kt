package com.reactnativehmssdk

import android.os.Build
import androidx.annotation.NonNull
import androidx.annotation.Nullable
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.HMSViewManagerDelegate
import com.facebook.react.viewmanagers.HMSViewManagerInterface

/**
 * HMSSDKViewManager — new-arch (Fabric) view manager for `<HMSView />`.
 *
 * Phase 1 / 1C-3 of the New Architecture migration. Compiled only when
 * the consumer's app uses new architecture.
 *
 * Differences from the old-arch wrapper at src/oldarch/.../HMSSDKViewManager.kt:
 *   - Implements the Codegen-generated `HMSViewManagerInterface<HMSView>`
 *     (typed prop setters that Fabric calls directly).
 *   - Uses `HMSViewManagerDelegate` (also Codegen-generated) for
 *     prop dispatch via Fabric's mounting mechanism.
 *   - Drops @ReactProp annotations — Fabric doesn't scan for them;
 *     it uses the typed interface.
 *
 * Both arches still extend `SimpleViewManager<HMSView>` so the same
 * paper-side machinery (event-type registration, commands map) works.
 *
 * All logic delegates to HMSSDKViewManagerImpl in src/main/.
 */
class HMSSDKViewManager :
  SimpleViewManager<HMSView>(),
  HMSViewManagerInterface<HMSView> {
  private val mDelegate: ViewManagerDelegate<HMSView> = HMSViewManagerDelegate(this)
  private var reactContext: ThemedReactContext? = null

  override fun getName(): String = HMSSDKViewManagerImpl.REACT_CLASS

  override fun getDelegate(): ViewManagerDelegate<HMSView> = mDelegate

  override fun createViewInstance(reactContext: ThemedReactContext): HMSView {
    this.reactContext = reactContext
    return HMSSDKViewManagerImpl.createViewInstance(reactContext)
  }

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

  @Nullable
  override fun getCommandsMap(): Map<String, Int>? = HMSSDKViewManagerImpl.getCommandsMap()

  /** Codegen-interface typed `capture` command — Fabric dispatches here. */
  override fun capture(
    view: HMSView,
    requestId: Int,
  ) = HMSSDKViewManagerImpl.capture(view, requestId)

  // ─────────────────────────────────────────────────────────────────
  // Codegen-interface methods (typed prop setters dispatched by Fabric)
  // ─────────────────────────────────────────────────────────────────

  override fun setData(
    view: HMSView,
    value: ReadableMap?,
  ) {
    if (value != null) HMSSDKViewManagerImpl.setData(view, value, reactContext)
  }

  override fun setScaleType(
    view: HMSView,
    value: String?,
  ) = HMSSDKViewManagerImpl.setScaleType(view, value)

  override fun setSetZOrderMediaOverlay(
    view: HMSView,
    value: Boolean,
  ) = HMSSDKViewManagerImpl.setZOrderMediaOverlay(view, value)

  override fun setAutoSimulcast(
    view: HMSView,
    value: Boolean,
  ) = HMSSDKViewManagerImpl.setAutoSimulcast(view, value)
}
