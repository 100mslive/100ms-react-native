import type { HMSPeer } from './HMSPeer';
import type { HMSRtmpStreamingState } from './HMSRtmpStreamingState';
import type { HMSServerRecordingState } from './HMSServerRecordingState';
import type { HMSBrowserRecordingState } from './HMSBrowserRecordingState';
import type { HMSHLSStreamingState } from './HMSHLSStreamingState';
import type { HMSHLSRecordingState } from './HMSHLSRecordingState';
import type { HMSLocalPeer } from './HMSLocalPeer';
import { getHmsRoomCache, getHMSRoomPropertyFromNative } from './HMSRoomCache';
import { HMSConstants } from './HMSConstants';

export class HMSRoom {
  id: string;
  // startedAt?: Date;

  constructor(params: { id: string }) {
    this.id = params.id;
    // this.startedAt = params.startedAt;
  }

  get sessionId(): string {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('sessionId');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'sessionId'
    );
  }

  get name(): string {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('name');
    }

    return getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, 'name');
  }

  get metaData(): string | undefined {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('metaData');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'metaData'
    );
  }

  get peers(): HMSPeer[] {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('peers');
    }

    return getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, 'peers');
  }

  get browserRecordingState(): HMSBrowserRecordingState {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('browserRecordingState');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'browserRecordingState'
    );
  }

  get rtmpHMSRtmpStreamingState(): HMSRtmpStreamingState {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('rtmpHMSRtmpStreamingState');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'rtmpHMSRtmpStreamingState'
    );
  }

  get serverRecordingState(): HMSServerRecordingState {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('serverRecordingState');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'serverRecordingState'
    );
  }

  get hlsStreamingState(): HMSHLSStreamingState {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('hlsStreamingState');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'hlsStreamingState'
    );
  }

  get hlsRecordingState(): HMSHLSRecordingState | undefined {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('hlsRecordingState');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'hlsRecordingState'
    );
  }

  get peerCount(): number | null {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('peerCount');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'peerCount'
    );
  }

  get localPeer(): HMSLocalPeer {
    const hmsRoomCache = getHmsRoomCache();

    if (hmsRoomCache) {
      return hmsRoomCache.getProperty('localPeer');
    }

    return getHMSRoomPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      'localPeer'
    );
  }
}
