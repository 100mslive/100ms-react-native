/**
 * Fabric component spec for `<HMSView />` — the native video tile.
 *
 * Used to render an `HMSVideoTrack` inside a React Native view tree.
 * Today's implementation lives in `ios/HMSView.swift` (paper) and
 * `android/.../HMSSDKViewManager.kt` + `HMSView.kt` (paper). Phase 1
 * adds Fabric counterparts (`ios/HMSViewComponentView.mm`,
 * `android/.../HMSSDKViewManager.kt` reworked to implement the generated
 * `HMSViewManagerInterface`).
 *
 * Note: Fabric component specs require explicit prop and event payload
 * shapes — Codegen does NOT accept `Object` for view props/events the
 * way it does for TurboModule method payloads. The shapes below are
 * narrow and well-known, so this isn't the same scaling problem as the
 * TurboModule's 99-method surface.
 *
 * Surface authored: 4 props + 1 imperative command (`capture`) +
 * 2 events (`onChange` for resolution updates, `onDataReturned` for
 * capture command responses).
 */

import type * as React from 'react';
import type { ViewProps, HostComponent } from 'react-native';
import type {
  DirectEventHandler,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

/**
 * Bag of identifiers passed to the native view to wire it up to a track.
 * Mirrors the shape constructed in `src/classes/HmsView.tsx`.
 */
type DataProp = Readonly<{
  trackId: string;
  id: string;
  mirror: boolean;
  scaleType: string;
}>;

/**
 * Emitted when the video stream's resolution changes (e.g. simulcast
 * layer switch). Native fires `topChange`; the JS-side dispatches as
 * `onChange`. Used to drive Android view-sizing in `HmsView.tsx`.
 */
type OnChangeEvent = Readonly<{
  event: string;
  data: Readonly<{
    height: Int32;
    width: Int32;
  }>;
}>;

/**
 * Emitted in response to the `capture` imperative command. Carries the
 * requestId from JS and either a base64 result or an error tuple.
 */
type OnDataReturnedEvent = Readonly<{
  requestId: Int32;
  result?: string;
  error?: string;
}>;

interface NativeProps extends ViewProps {
  /** Track identifier bag. See {@link DataProp}. */
  data?: DataProp;

  /**
   * Enable automatic simulcast layer switching based on network
   * conditions. iOS-side default in `HMSView.swift` is true.
   */
  autoSimulcast?: WithDefault<boolean, true>;

  /**
   * How the video fits within the view. Values defined in
   * `src/classes/HMSVideoViewMode.ts` (ASPECT_FIT, ASPECT_FILL,
   * ASPECT_BALANCED).
   */
  scaleType?: WithDefault<string, 'ASPECT_FILL'>;

  /**
   * Render the video above the regular view hierarchy.
   * Platform: Android only — iOS view manager does not implement this.
   */
  setZOrderMediaOverlay?: WithDefault<boolean, false>;

  /**
   * Resolution-change events. Renamed from `onChange` to avoid colliding with
   * RN's built-in `topChange` internal event (registered as bubbling on every
   * RCTView), which triggers "Event cannot be both direct and bubbling".
   */
  onResolutionChange?: DirectEventHandler<OnChangeEvent>;

  /** Capture command response (success or error). */
  onDataReturned?: DirectEventHandler<OnDataReturnedEvent>;
}

/**
 * Imperative commands callable on a `<HMSView />` ref.
 */
interface NativeCommands {
  /**
   * Capture a snapshot of the current video frame. The result (or
   * error) is delivered asynchronously via the `onDataReturned` event,
   * matched to this call by `requestId`.
   */
  capture: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    requestId: Int32
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['capture'],
});

export default codegenNativeComponent<NativeProps>('HMSView');
