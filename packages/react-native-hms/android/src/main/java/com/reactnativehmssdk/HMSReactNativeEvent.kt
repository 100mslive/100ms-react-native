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
  private val eventName: String,
  private val payload: WritableMap?,
) : Event<HMSReactNativeEvent>(surfaceId, viewId) {
  override fun getEventName(): String = eventName

  override fun getEventData(): WritableMap? = payload
}
