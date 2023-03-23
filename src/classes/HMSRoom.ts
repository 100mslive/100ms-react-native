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

  constructor(params: { id: string; }) {
    this.id = params.id;
  }

  get sessionId() : string {
    const hmsRoomCache = getHmsRoomCache();

    let data: string;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("sessionId");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "sessionId");
    }

    return data;
  }

  get name() : string {
    const hmsRoomCache = getHmsRoomCache();

    let data: string;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("name");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "name");
    }

    return data;
  }

  get metaData(): string | undefined {
    const hmsRoomCache = getHmsRoomCache();

    let data: string | undefined;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("metaData");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "metaData");
    }

    return data;
  }

  get peers(): HMSPeer[] {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSPeer[];

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("peers");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "peers");
    }

    return data;
  }

  get browserRecordingState(): HMSBrowserRecordingState {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSBrowserRecordingState;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("browserRecordingState");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "browserRecordingState");
    }

    return data;
  }

  get rtmpHMSRtmpStreamingState(): HMSRtmpStreamingState {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSRtmpStreamingState;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("rtmpHMSRtmpStreamingState");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "rtmpHMSRtmpStreamingState");
    }

    return data;
  }

  get serverRecordingState(): HMSServerRecordingState {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSServerRecordingState;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("serverRecordingState");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "serverRecordingState");
    }

    return data;
  }

  get hlsStreamingState(): HMSHLSStreamingState {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSHLSStreamingState;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("hlsStreamingState");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "hlsStreamingState");
    }

    return data;
  }

  get hlsRecordingState(): HMSHLSRecordingState | undefined {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSHLSRecordingState | undefined;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("hlsRecordingState");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "hlsRecordingState");
    }

    return data;
  }

  get peerCount(): number {
    const hmsRoomCache = getHmsRoomCache();

    let data: number;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("peerCount");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "peerCount");
    }

    return data;
  }

  get localPeer(): HMSLocalPeer {
    const hmsRoomCache = getHmsRoomCache();

    let data: HMSLocalPeer;

    if (hmsRoomCache) {
      data = hmsRoomCache.getProperty("localPeer");
    } else {
      data = getHMSRoomPropertyFromNative(HMSConstants.DEFAULT_SDK_ID, "localPeer");
    }

    return data;
  }
}
