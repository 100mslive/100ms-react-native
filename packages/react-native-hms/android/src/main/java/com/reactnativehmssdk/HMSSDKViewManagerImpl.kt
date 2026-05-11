package com.reactnativehmssdk

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext

/**
 * HMSSDKViewManagerImpl — shared view-manager logic for `<HMSView />`.
 *
 * Phase 1 / 1C-3 of the New Architecture migration. View-manager
 * responsibilities (creating the view, prop dispatch, command handling,
 * event-type registration) live here as static helpers. Arch-specific
 * wrappers live at:
 *   - android/src/oldarch/.../HMSSDKViewManager.kt
 *     (extends SimpleViewManager — paper)
 *   - android/src/newarch/.../HMSSDKViewManager.kt
 *     (extends SimpleViewManager + implements the Codegen-generated
 *     HMSViewManagerInterface — Fabric)
 *
 * Both wrappers delegate every call here, so the actual logic stays
 * in one place.
 */
class HMSSDKViewManagerImpl {
  companion object {
    const val REACT_CLASS = "HMSView"

    fun createViewInstance(reactContext: ThemedReactContext): HMSView = HMSView(reactContext)

    /**
     * Set the `data` prop. Resolves the active SDK instance via the
     * passed-in `reactContext` (route through `reactApplicationContext`
     * for new-arch interop / bridgeless safety).
     */
    fun setData(
      view: HMSView,
      data: ReadableMap,
      reactContext: ThemedReactContext?,
    ) {
      val trackId = data.getString("trackId")
      val id = data.getString("id")
      val mirror = data.getBoolean("mirror")
      val scaleType = data.getString("scaleType")
      val hmsCollection = getHmsCollection(reactContext) ?: return
      view.setData(id, trackId, hmsCollection, mirror, scaleType)
    }

    fun setScaleType(
      view: HMSView,
      data: String?,
    ) = view.updateScaleType(data)

    fun setZOrderMediaOverlay(
      view: HMSView,
      data: Boolean?,
    ) = view.updateZOrderMediaOverlay(data)

    fun setAutoSimulcast(
      view: HMSView,
      data: Boolean?,
    ) {
      data?.let { view.updateAutoSimulcast(it) }
    }

    /** Imperative `capture` command (paper — args is a numeric-array). */
    fun capture(
      view: HMSView,
      args: ReadableArray?,
    ) = view.captureHmsView(args)

    /** Imperative `capture` command (Fabric — typed `requestId`). */
    fun capture(
      view: HMSView,
      requestId: Int,
    ) {
      val args = Arguments.createArray().apply { pushInt(requestId) }
      view.captureHmsView(args)
    }

    fun getCommandsMap(): Map<String, Int> = MapBuilder.of("capture", 1)

    /**
     * Both events are DIRECT, matching the Codegen spec which declares both as
     * `DirectEventHandler<...>`. The names are deliberately unique (not the
     * default `topChange`) to avoid colliding with RN's built-in `topChange`
     * (which RN registers as bubbling on every RCTView), which would trigger
     * "Event cannot be both direct and bubbling" at runtime.
     *
     * - `topResolutionChange` → JS receives as `onResolutionChange`.
     * - `captureFrame`        → JS receives as `onDataReturned`.
     */
    fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
      MapBuilder
        .builder<String, Any>()
        .put("topResolutionChange", MapBuilder.of("registrationName", "onResolutionChange"))
        .put("captureFrame", MapBuilder.of("registrationName", "onDataReturned"))
        .build()

    /**
     * Look up the active SDK instances map. Routes through
     * `reactApplicationContext` rather than `themedContext.getNativeModule`
     * directly — the themed-context lookup is unreliable under the New
     * Architecture Interop Layer / bridgeless mode.
     */
    fun getHmsCollection(reactContext: ThemedReactContext?): MutableMap<String, HMSRNSDK>? =
      reactContext
        ?.reactApplicationContext
        ?.getNativeModule(HMSManager::class.java)
        ?.getHmsInstance()
  }
}
