/**
 * Fabric component spec for `<HMSHLSPlayer />`.
 *
 * Renders an HLS stream from the live room (host-published or recorded).
 * Today's implementation lives in `ios/HMSHLSPlayerManager.swift` (paper)
 * and `android/.../HMSHLSPlayerManager.kt` + `HMSHLSPlayer.kt` (paper).
 * Phase 1 adds Fabric counterparts.
 *
 * This is the most surface-heavy component in the SDK:
 *   - 3 props (`url`, `enableStats`, `enableControls`)
 *   - 4 events (playback state, stats, request-response, captions)
 *   - 13 imperative commands
 *
 * Like {@link HMSViewNativeComponent}, Fabric requires explicit prop and
 * event payload shapes. For Phase 1 we use minimal shapes that capture
 * essential fields (e.g. `requestId` for response events) and leave the
 * rest loose. Phase 2 tightens.
 */

import type * as React from 'react';
import type { ViewProps, HostComponent } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

// ─────────────────────────────────────────────────────────────────────────
// Event payload shapes
// ─────────────────────────────────────────────────────────────────────────

/**
 * Playback state-change event payload.
 * Today's emitter in `HMSHLSPlayer.kt` / iOS counterpart sends an
 * `eventType` plus a state-specific data object. Phase 2 will type the
 * `data` field per state; Phase 1 carries it as a string blob.
 */
type OnHmsHlsPlaybackEventPayload = Readonly<{
  event: string;
  data: string;
}>;

/**
 * Stats event payload (RTC-shape stats: bitrate, dropped frames, etc.).
 * Carried as a stringified JSON blob for Phase 1; Phase 2 types it.
 */
type OnHmsHlsStatsEventPayload = Readonly<{
  event: string;
  data: string;
}>;

/**
 * Response event for the request-style commands (`areClosedCaptionSupported`,
 * `isClosedCaptionEnabled`, `getPlayerDurationDetails`). The JS-side
 * matches the response to the in-flight Promise via `requestId`.
 */
type OnDataReturnedPayload = Readonly<{
  requestId: Int32;
  result?: string;
  error?: string;
}>;

/**
 * Closed-captions cue payload. Native-side fires a cue object with start
 * time, end time, payload string, etc. Phase 1 keeps it as a stringified
 * blob; Phase 2 will type it.
 */
type OnHlsPlayerCuesEventPayload = Readonly<{
  event: string;
  data: string;
}>;

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface NativeProps extends ViewProps {
  /** HLS stream URL to play. */
  url?: string;

  /** Emit periodic stats events via `onHmsHlsStatsEvent`. */
  enableStats?: WithDefault<boolean, false>;

  /** Show the native player's built-in controls UI overlay. */
  enableControls?: WithDefault<boolean, false>;

  /** Playback state changes (started/paused/buffering/ended/...). */
  onHmsHlsPlaybackEvent?: DirectEventHandler<OnHmsHlsPlaybackEventPayload>;

  /** Periodic stats (only fired when `enableStats=true`). */
  onHmsHlsStatsEvent?: DirectEventHandler<OnHmsHlsStatsEventPayload>;

  /** Response for request-style commands; matched by `requestId`. */
  onDataReturned?: DirectEventHandler<OnDataReturnedPayload>;

  /** Closed-captions cue events. */
  onHlsPlayerCuesEvent?: DirectEventHandler<OnHlsPlayerCuesEventPayload>;
}

// ─────────────────────────────────────────────────────────────────────────
// Imperative commands (13)
//
// `requestId`-bearing commands deliver their response via the
// `onDataReturned` event (see {@link OnDataReturnedPayload}). The JS
// wrapper in `src/components/HMSHLSPlayer/HMSHLSPlayer.tsx` currently
// allocates the requestId and resolves a promise on response; Phase 1
// keeps that pattern.
// ─────────────────────────────────────────────────────────────────────────

export interface NativeCommands {
  /** Start playing. Pass `''` (empty string) to reuse the URL prop. */
  play: (viewRef: React.ElementRef<HostComponent<NativeProps>>, url: string) => void;

  /** Stop playback (releases the player). */
  stop: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;

  /** Pause playback (player remains allocated). */
  pause: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;

  /** Resume from paused state. */
  resume: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;

  /** Jump to the live edge (DVR HLS only). */
  seekToLivePosition: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;

  /** Seek `seconds` ahead from current position. */
  seekForward: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    seconds: Double
  ) => void;

  /** Seek `seconds` back from current position. */
  seekBackward: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    seconds: Double
  ) => void;

  /** Set volume `0–100` (integer). */
  setVolume: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    level: Int32
  ) => void;

  /**
   * Query whether the stream supports closed captions. Response via
   * `onDataReturned` matched by `requestId`.
   */
  areClosedCaptionSupported: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    requestId: Int32
  ) => void;

  /**
   * Query whether closed captions are currently enabled. Response via
   * `onDataReturned` matched by `requestId`.
   */
  isClosedCaptionEnabled: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    requestId: Int32
  ) => void;

  /** Enable closed captions display. */
  enableClosedCaption: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;

  /** Disable closed captions display. */
  disableClosedCaption: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;

  /**
   * Get current player duration details (currentTime, duration, live).
   * Response via `onDataReturned` matched by `requestId`.
   */
  getPlayerDurationDetails: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    requestId: Int32
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'play',
    'stop',
    'pause',
    'resume',
    'seekToLivePosition',
    'seekForward',
    'seekBackward',
    'setVolume',
    'areClosedCaptionSupported',
    'isClosedCaptionEnabled',
    'enableClosedCaption',
    'disableClosedCaption',
    'getPlayerDurationDetails',
  ],
});

export default codegenNativeComponent<NativeProps>('HMSHLSPlayer');
