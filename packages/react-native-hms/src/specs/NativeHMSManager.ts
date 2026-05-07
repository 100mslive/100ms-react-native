/**
 * @100mslive/react-native-hms — TurboModule spec for HMSManager.
 *
 * This file is the source of truth for the JS↔native contract under
 * React Native's New Architecture. At build time, RN's Codegen reads
 * this spec and produces:
 *
 *   - iOS:     ios/build/.../NativeHMSManagerSpec.h (Obj-C++ protocol)
 *   - Android: android/build/.../NativeHMSManagerSpec.java (abstract class)
 *   - JS:      typed wrappers + JSI fast-path bindings
 *
 * Phase 1 of the New Architecture migration uses **Object-typed** payloads
 * (every dictionary in/out is just `Object`) to preserve today's runtime
 * behavior without designing 99 typed payload schemas upfront. Phase 2 will
 * tighten types per API surface area (room/peer/track core first, then
 * chat, polls, recording, etc.).
 *
 * Method count: 99 iOS (96 async + 3 sync), 98 Android (93 async + 5 sync).
 * Event count: 28 unique events (24 cross-platform + 4 platform-specific).
 *
 * Cross-platform asymmetries are noted inline. See
 * NEW_ARCHITECTURE_MIGRATION.md / 100ms-rn-new-arch-migration-plan.md.md
 * for the full migration plan.
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // ─────────────────────────────────────────────────────────────────────
  // 1. Lifecycle
  // ─────────────────────────────────────────────────────────────────────

  build(data: Object): Promise<Object>;
  destroy(data: Object): Promise<Object>;
  preview(credentials: Object): void; // fire-and-forget on iOS
  previewForRole(data: Object): Promise<Object>;
  cancelPreview(data: Object): Promise<Object>;
  join(credentials: Object): void; // fire-and-forget on iOS
  leave(data: Object): Promise<Object>;
  endRoom(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 2. Track operations
  // ─────────────────────────────────────────────────────────────────────

  setLocalMute(data: Object): Promise<Object>;
  setLocalVideoMute(data: Object): Promise<Object>;
  switchCamera(data: Object): void; // fire-and-forget
  isMute(data: Object): Promise<Object>;
  changeTrackState(data: Object): Promise<Object>;
  changeTrackStateForRoles(data: Object): Promise<Object>;
  setVolume(data: Object): Promise<Object>;
  remoteMuteAllAudio(data: Object): Promise<Object>;
  setPlaybackAllowed(data: Object): Promise<Object>;
  isPlaybackAllowed(data: Object): Promise<Object>;
  setPlaybackForAllAudio(mute: Object): Promise<Object>;
  getRemoteVideoTrackFromTrackId(data: Object): Promise<Object>;
  getRemoteAudioTrackFromTrackId(data: Object): Promise<Object>;
  getVideoTrackLayer(data: Object): Promise<Object>;
  getVideoTrackLayerDefinition(data: Object): Promise<Object>;
  setVideoTrackLayer(data: Object): Promise<Object>;
  captureImageAtMaxSupportedResolution(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 3. Peer operations
  // ─────────────────────────────────────────────────────────────────────

  getLocalPeer(data: Object): Promise<Object>;
  getRemotePeers(data: Object): Promise<Object>;
  getRoles(data: Object): Promise<Object>;
  getRoom(data: Object): Promise<Object>;
  changeName(data: Object): Promise<Object>;
  changeMetadata(data: Object): Promise<Object>;
  changeRole(data: Object): Promise<Object>;
  changeRoleOfPeer(data: Object): Promise<Object>;
  changeRoleOfPeersWithRoles(data: Object): Promise<Object>;
  acceptRoleChange(data: Object): Promise<Object>;
  removePeer(data: Object): Promise<Object>;
  raiseLocalPeerHand(data: Object): Promise<Object>;
  lowerLocalPeerHand(data: Object): Promise<Object>;
  lowerRemotePeerHand(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 4. Peer list iterator (large-room support)
  // ─────────────────────────────────────────────────────────────────────

  // getPeerListIterator is sync — see "Synchronous methods" section below.
  peerListIteratorHasNext(data: Object): Promise<Object>;
  peerListIteratorNext(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 5. Messaging
  // ─────────────────────────────────────────────────────────────────────

  sendBroadcastMessage(data: Object): Promise<Object>;
  sendGroupMessage(data: Object): Promise<Object>;
  sendDirectMessage(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 6. RTMP / Recording / HLS streaming
  // ─────────────────────────────────────────────────────────────────────

  startRTMPOrRecording(data: Object): Promise<Object>;
  stopRtmpAndRecording(data: Object): Promise<Object>;
  startHLSStreaming(data: Object): Promise<Object>;
  stopHLSStreaming(data: Object): Promise<Object>;
  sendHLSTimedMetadata(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 7. Screen share
  // ─────────────────────────────────────────────────────────────────────

  startScreenshare(data: Object): Promise<Object>;
  stopScreenshare(data: Object): Promise<Object>;
  isScreenShared(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 8. Audio share — iOS API
  // Platform: iOS only. Android uses the startAudioshare/stopAudioshare
  // pair below.
  // ─────────────────────────────────────────────────────────────────────

  playAudioShare(data: Object): Promise<Object>; // iOS only
  pauseAudioShare(data: Object): Promise<Object>; // iOS only
  resumeAudioShare(data: Object): Promise<Object>; // iOS only
  stopAudioShare(data: Object): Promise<Object>; // iOS only
  setAudioShareVolume(data: Object): Promise<Object>; // iOS only
  audioShareCurrentTime(data: Object): Promise<Object>; // iOS only
  audioShareDuration(data: Object): Promise<Object>; // iOS only
  audioShareIsPlaying(data: Object): Promise<Object>; // iOS only

  // ─────────────────────────────────────────────────────────────────────
  // 9. Audio share — Android API
  // Platform: Android only. iOS uses the playAudioShare/... family above.
  // ─────────────────────────────────────────────────────────────────────

  startAudioshare(data: Object): Promise<Object>; // Android only — note lowercase 's'
  stopAudioshare(data: Object): Promise<Object>; // Android only — note lowercase 's'
  isAudioShared(data: Object): Promise<Object>; // Android only

  // ─────────────────────────────────────────────────────────────────────
  // 10. Audio output / devices
  // ─────────────────────────────────────────────────────────────────────

  switchAudioOutput(data: Object): Promise<Object>;
  switchAudioOutputUsingIOSUI(data: Object): Promise<Object>; // iOS only
  getAudioDevicesList(data: Object): Promise<Object>; // Android only
  getAudioOutputRouteType(data: Object): Promise<Object>; // Android only
  setAudioDeviceChangeListener(data: Object): void; // Android only
  setAudioMode(data: Object): Promise<Object>; // Android only
  setAudioMixingMode(data: Object): Promise<Object>; // Android only
  getAudioMixingMode(data: Object): Promise<Object>; // Android only
  getVolume(data: Object): Promise<Object>; // Android only

  // ─────────────────────────────────────────────────────────────────────
  // 11. Picture-in-Picture
  // ─────────────────────────────────────────────────────────────────────

  // handlePipActions is the only multi-argument method on the bridge. The
  // first argument is the action name (string), the second is the payload.
  handlePipActions(action: string, data: Object): Promise<Object>;
  setupPIP(data: Object): Promise<Object>; // iOS only
  stopPIP(data: Object): Promise<Object>; // iOS only
  disposePIP(data: Object): Promise<Object>; // iOS only
  isPIPActive(data: Object): Promise<Object>; // iOS only
  changeIOSPIPVideoTrack(data: Object): Promise<Object>; // iOS only
  setActiveSpeakerInIOSPIP(data: Object): Promise<Object>; // iOS only

  // ─────────────────────────────────────────────────────────────────────
  // 12. Network quality
  // ─────────────────────────────────────────────────────────────────────

  enableNetworkQualityUpdates(data: Object): void;
  disableNetworkQualityUpdates(data: Object): void;

  // ─────────────────────────────────────────────────────────────────────
  // 13. Session store / metadata
  // ─────────────────────────────────────────────────────────────────────

  getSessionMetadataForKey(data: Object): Promise<Object>;
  setSessionMetadataForKey(data: Object): Promise<Object>;
  addKeyChangeListener(data: Object): Promise<Object>;
  removeKeyChangeListener(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 14. Polls / Quiz
  // ─────────────────────────────────────────────────────────────────────

  quickStartPoll(data: Object): Promise<Object>;
  addResponseOnPollQuestion(data: Object): Promise<Object>;
  stopPoll(data: Object): Promise<Object>;
  fetchLeaderboard(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 15. Whiteboard
  // ─────────────────────────────────────────────────────────────────────

  startWhiteboard(data: Object): Promise<Object>;
  stopWhiteboard(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 16. Transcripts
  // ─────────────────────────────────────────────────────────────────────

  handleRealTimeTranscription(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 17. Noise cancellation
  // ─────────────────────────────────────────────────────────────────────

  enableNoiseCancellationPlugin(data: Object): Promise<Object>;
  disableNoiseCancellationPlugin(data: Object): Promise<Object>;
  isNoiseCancellationPluginEnabled(data: Object): Promise<Object>;
  isNoiseCancellationPluginAvailable(data: Object): Promise<Object>;

  // ─────────────────────────────────────────────────────────────────────
  // 18. Video plugin (virtual background, filters)
  // Platform: iOS only. Android delegates to the separate
  // @100mslive/react-native-video-plugin package.
  // ─────────────────────────────────────────────────────────────────────

  enableVideoPlugin(data: Object): Promise<Object>; // iOS only
  disableVideoPlugin(data: Object): Promise<Object>; // iOS only
  changeVirtualBackground(data: Object): Promise<Object>; // iOS only
  setVideoFilterParameter(data: Object): Promise<Object>; // iOS only

  // ─────────────────────────────────────────────────────────────────────
  // 19. Misc / system / config
  // ─────────────────────────────────────────────────────────────────────

  enableEvent(data: Object): Promise<Object>;
  disableEvent(data: Object): Promise<Object>;
  restrictData(data: Object): Promise<Object>;
  getAuthTokenByRoomCode(data: Object): Promise<Object>;
  getRoomLayout(data: Object): Promise<Object>;
  setAlwaysScreenOn(data: Object): Promise<Object>;
  hideSystemBars(): void; // Android only
  showSystemBars(): void; // Android only
  setPermissionsAccepted(data: Object): Promise<Object>; // Android only
  checkNotifications(): Promise<Object>; // Android only

  // ─────────────────────────────────────────────────────────────────────
  // 20. Synchronous methods
  // These bypass the Promise queue and run on the JS thread directly.
  // Codegen syntax: non-Promise return type signals sync.
  // ─────────────────────────────────────────────────────────────────────

  // Cross-platform sync methods (iOS + Android)
  getPeerProperty(data: Object): Object;
  getRoomProperty(data: Object): Object;
  getPeerListIterator(data: Object): Object;

  // Android-only sync methods
  setSoftInputMode(inputMode: number): number; // Android only
  getSoftInputMode(): number; // Android only

  // ─────────────────────────────────────────────────────────────────────
  // 21. Events — DEFERRED TO PHASE 2
  //
  // RN 0.77 (our current peer-dep floor) does NOT export the typed
  // `EventEmitter<TPayload>` symbol from
  // `react-native/Libraries/Types/CodegenTypes`; that's a 0.82+ feature.
  //
  // For Phase 1, events continue to flow through legacy `RCTEventEmitter`
  // (iOS) / `DeviceEventEmitter` (Android) exactly as they do today —
  // unchanged at runtime. They are NOT declared in this spec.
  //
  // When we bump the RN peer-dep floor to 0.82+ (likely as part of the
  // Phase 4 legacy-paper drop), Phase 2 will add typed event
  // declarations here. The 28-event inventory has been catalogued
  // separately in the migration plan doc — no information is lost by
  // not declaring them here today.
  //
  // The 28 events to add later (24 cross-platform + 4 platform-specific):
  //   onPreview, onJoin, onRoomUpdate, onPeerUpdate (string value '3'),
  //   onPeerListUpdated, onTrackUpdate, onRoleChangeRequest,
  //   onChangeTrackStateRequest, onRemovedFromRoom, onError, onMessage,
  //   onSpeaker, onReconnecting, onReconnected, onRtcStats,
  //   onLocalAudioStats, onLocalVideoStats, onRemoteAudioStats,
  //   onRemoteVideoStats, onSessionStoreAvailable,
  //   onSessionStoreChanged, onTranscripts, onPollUpdate,
  //   onWhiteboardUpdate, onAudioDeviceChanged (Android),
  //   onPermissionsRequested (Android), onPipModeChanged,
  //   onPipRoomLeave (Android).
  // ─────────────────────────────────────────────────────────────────────
}

export default TurboModuleRegistry.getEnforcing<Spec>('HMSManager');
