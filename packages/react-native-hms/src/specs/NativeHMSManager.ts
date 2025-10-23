/**
 * This is a TurboModule spec for HMSManager
 * It defines the interface between JavaScript and native code
 *
 * Note: Using generic Object types for initial migration
 * TODO: Refine with specific types from HMS SDK classes
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Core SDK Methods
  build(data: Object): Promise<string>;
  destroy(data: Object): Promise<Object>;

  // Room Prebuilt
  getRoomLayout(data: Object): Promise<Object>;

  // Preview Methods
  preview(credentials: Object): void;
  previewForRole(data: Object): Promise<Object>;
  cancelPreview(data: Object): Promise<Object>;

  // Join/Leave Methods
  join(credentials: Object): void;
  leave(data: Object): Promise<Object>;

  // Audio Methods
  setLocalMute(data: Object): Promise<Object>;
  setLocalVideoMute(data: Object): Promise<Object>;
  switchCamera(data: Object): void;
  isMute(data: Object): Promise<boolean>;
  setPlaybackAllowed(data: Object): Promise<Object>;
  isPlaybackAllowed(data: Object): Promise<boolean>;
  setPlaybackForAllAudio(data: Object): Promise<Object>;
  remoteMuteAllAudio(data: Object): Promise<Object>;
  setVolume(data: Object): Promise<Object>;
  switchAudioOutput(data: Object): Promise<Object>;

  // Video Methods
  switchVideoSource(data: Object): void;
  captureImageAtMaxSupportedResolution(data: Object): Promise<Object>;

  // Role & Permissions
  changeRole(data: Object): Promise<Object>;
  acceptChangeRole(data: Object): void;
  changeTrackState(data: Object): Promise<Object>;
  changeTrackStateForRoles(data: Object): Promise<Object>;

  // Remote Peer Methods
  remoteMuteAllVideo(data: Object): Promise<Object>;
  endRoom(data: Object): Promise<Object>;
  removePeer(data: Object): Promise<Object>;
  changeRoleOfPeer(data: Object): Promise<Object>;
  changeRoleOfPeersWithRoles(data: Object): Promise<Object>;

  // Messaging
  sendBroadcastMessage(data: Object): Promise<Object>;
  sendGroupMessage(data: Object): Promise<Object>;
  sendDirectMessage(data: Object): Promise<Object>;

  // Recording & Streaming
  startRtmpOrRecording(data: Object): Promise<Object>;
  stopRtmpAndRecording(data: Object): Promise<Object>;
  startHlsStreaming(data: Object): Promise<Object>;
  stopHlsStreaming(data: Object): Promise<Object>;

  // Network & Stats
  enableRTCStats(data: Object): void;
  disableRTCStats(data: Object): void;

  // Utility Methods
  getRoom(data: Object): Promise<Object>;
  getLocalPeer(data: Object): Promise<Object>;
  getRemotePeers(data: Object): Promise<Object>;
  getPeerById(data: Object): Promise<Object | null>;

  // Session Store (Interactivity)
  sessionStoreGet(data: Object): Promise<Object | null>;
  sessionStoreSet(data: Object): Promise<Object>;
  sessionStoreObserve(data: Object): Promise<Object>;

  // Polls
  quickStartPoll(data: Object): Promise<Object>;
  addSingleChoicePollResponse(data: Object): Promise<Object>;
  addMultiChoicePollResponse(data: Object): Promise<Object>;
  stopPoll(data: Object): Promise<Object>;
  fetchPollList(data: Object): Promise<Object>;
  fetchPollQuestions(data: Object): Promise<Object>;
  fetchLeaderboard(data: Object): Promise<Object>;
  fetchPollResults(data: Object): Promise<Object>;

  // Whiteboard
  startWhiteboard(data: Object): Promise<Object>;
  stopWhiteboard(data: Object): Promise<Object>;

  // Transcription
  startTranscription(data: Object): Promise<Object>;
  stopTranscription(data: Object): Promise<Object>;

  // Noise Cancellation
  enableNoiseCancellationPlugin(data: Object): Promise<Object>;
  disableNoiseCancellationPlugin(data: Object): Promise<Object>;
  isNoiseCancellationPluginAvailable(data: Object): Promise<boolean>;
  isNoiseCancellationPluginEnabled(data: Object): Promise<boolean>;

  // PIP (Picture in Picture)
  enterPipMode(data: Object): Promise<Object>;
  isPipActive(data: Object): Promise<boolean>;
  setupPIP(data: Object): Promise<Object>;
  destroyPIP(data: Object): Promise<Object>;

  // Camera Controls
  isSupported(): Promise<boolean>;
  capture(data: Object): Promise<Object>;

  // Audio Mixing
  setAudioMixingMode(data: Object): Promise<Object>;

  // Frame Rate
  setFrameRate(data: Object): Promise<Object>;

  // Simulcast
  setSimulcastLayer(data: Object): Promise<Object>;
  getSimulcastDefinitions(data: Object): Promise<Object>;

  // Always Available Track
  setAlwaysScreenOn(data: Object): void;

  // Logger
  setLogger(data: Object): Promise<Object>;
  updateLogger(data: Object): Promise<Object>;

  // Name update
  changeName(data: Object): Promise<Object>;
  changeMetadata(data: Object): Promise<Object>;

  // Audio share
  setAudioMode(data: Object): Promise<Object>;

  // Raise hand
  raiseLocalPeerHand(data: Object): Promise<Object>;
  lowerLocalPeerHand(data: Object): Promise<Object>;
  lowerRemotePeerHand(data: Object): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HMSManager');
