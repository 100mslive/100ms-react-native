package com.reactnativehmssdk

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/**
 * Generic view-event wrapper used by `<HMSView />` and `<HMSHLSPlayer />`.
 *
 * Replaces the legacy paper-only `getJSModule(RCTEventEmitter::class.java).receiveEvent(...)`
 * call. Dispatched through `UIManagerHelper.getEventDispatcherForReactTag(...)`,
 * which routes to paper's RCTEventEmitter or Fabric's typed event emitter
 * depending on which arch is active — including bridgeless mode.
 *
 * The event-name → JSX-prop mapping is registered separately in each view
 * manager via `getExportedCustomDirectEventTypeConstants()`.
 */
class HMSReactNativeEvent(
  surfaceId: Int,
  viewId: Int,
  // Renamed from `eventName` to `name` because RN 0.82's `Event<T>` introduced
  // a same-named member on the supertype; Kotlin 2.x (default in Gradle 8.13)
  // promotes the hides-supertype-member warning to an error.
  private val name: String,
  private val payload: WritableMap?,
) : Event<HMSReactNativeEvent>(surfaceId, viewId) {
  override fun getEventName(): String = name

  override fun getEventData(): WritableMap? = payload
}
