import { NativeModules } from 'react-native';
import type { HMSRoom } from './HMSRoom';
import { HMSEncoder } from './HMSEncoder';
import { HMSRoomUpdate } from './HMSRoomUpdate';

const { HMSManager } = NativeModules;

export let hmsRoomCache: HMSRoomCache | undefined;

export const getHmsRoomCache = () => hmsRoomCache;

export const setHmsRoomCache = (_hmsRoomCache: HMSRoomCache) => {
  hmsRoomCache = _hmsRoomCache;
};

export const clearHmsRoomCache = () => {
  if (hmsRoomCache) {
    hmsRoomCache.cleanup();
  }
  hmsRoomCache = undefined;
};

export type HMSRoomCacheProps = Partial<
  Omit<HMSRoom, 'id'>
>;

export class HMSRoomCache {
  private _data = new Map<keyof HMSRoomCacheProps, HMSRoomCacheProps[keyof HMSRoomCacheProps]>();
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getProperty<T extends keyof Required<HMSRoomCacheProps>>(property: T): Required<HMSRoomCacheProps>[T] {
    const value: any = this._data.get(property);

    if (value) {
      return value
    }

    const encodedValue = getHMSRoomPropertyFromNative(this.id, property);

    this._data.set(property, encodedValue);

    return encodedValue;
  }

  updateRoomCache(
    data: Record<keyof HMSRoomCacheProps, any>,
    updateType?: HMSRoomUpdate,
  ) {
    switch (updateType) {
      case HMSRoomUpdate.ROOM_MUTED:
      case HMSRoomUpdate.ROOM_UNMUTED: {
        break;
      }
      case HMSRoomUpdate.SERVER_RECORDING_STATE_UPDATED: {
        this._data.set("serverRecordingState", HMSEncoder.encodeServerRecordingState(data.serverRecordingState));
        break;
      }
      case HMSRoomUpdate.RTMP_STREAMING_STATE_UPDATED: {
        this._data.set("rtmpHMSRtmpStreamingState", HMSEncoder.encodeRTMPStreamingState(data.rtmpHMSRtmpStreamingState));
        break;
      }
      case HMSRoomUpdate.BROWSER_RECORDING_STATE_UPDATED: {
        this._data.set("browserRecordingState", HMSEncoder.encodeBrowserRecordingState(data.browserRecordingState));
        break;
      }
      case HMSRoomUpdate.HLS_STREAMING_STATE_UPDATED: {
        this._data.set("hlsStreamingState", HMSEncoder.encodeHLSStreamingState(data.hlsStreamingState));
        break;
      }
      case HMSRoomUpdate.HLS_RECORDING_STATE_UPDATED: {
        this._data.set("hlsRecordingState", HMSEncoder.encodeHLSRecordingState(data.hlsRecordingState));
        break;
      }
      default: {
        for (const key in data) {
          const property = key as keyof HMSRoomCacheProps; 

          if (Object.prototype.hasOwnProperty.call(data, property)) {
            const value = encodeHMSRoomProperty(this.id, property, data);
            this._data.set(property, value);
          }
        }
        break;
      }
    }
  }

  cleanup() {
    this._data.clear();
  }
}

export function getHMSRoomPropertyFromNative<T extends keyof HMSRoomCacheProps>(id: string, property: T): Required<HMSRoomCacheProps>[T] {
  const data: any = HMSManager.getRoomProperty({
    id,
    property,
  });

  if (!data) return data;

  const value = encodeHMSRoomProperty(id, property, data);

  return value;
}

function encodeHMSRoomProperty<T extends keyof HMSRoomCacheProps>(id: string, property: T, data: Record<string, any>): Required<HMSRoomCacheProps>[T] {
  let value;

  if (property === 'peers') {
    value = HMSEncoder.encodeHmsPeers(data.peers);
  }
  else if (property === 'browserRecordingState') {
    value = HMSEncoder.encodeBrowserRecordingState(data.browserRecordingState);
  }
  else if (property === 'rtmpHMSRtmpStreamingState') {
    value = HMSEncoder.encodeRTMPStreamingState(data.rtmpHMSRtmpStreamingState);
  }
  else if (property === 'serverRecordingState') {
    value = HMSEncoder.encodeServerRecordingState(data.serverRecordingState);
  }
  else if (property === 'hlsStreamingState') {
    value = HMSEncoder.encodeHLSStreamingState(data.hlsStreamingState);
  }
  else if (property === 'hlsRecordingState') {
    value = HMSEncoder.encodeHLSRecordingState(data.hlsRecordingState);
  }
  else if (property === 'localPeer') {
    value = HMSEncoder.encodeHmsLocalPeer(data.localPeer, id);
  }
  else {
    value = data[property];
  }

  return value;
}
