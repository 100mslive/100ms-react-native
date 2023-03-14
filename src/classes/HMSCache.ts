import { NativeModules } from 'react-native';
import type { HMSPeer } from './HMSPeer';
import { HMSEncoder } from './HMSEncoder';
import { HMSPeerUpdate } from './HMSPeerUpdate';
import { HMSTrackUpdate } from './HMSTrackUpdate';
import type { HMSTrack } from './HMSTrack';
import { HMSTrackType } from './HMSTrackType';
import { HMSTrackSource } from './HMSTrackSource';

const { HMSManager } = NativeModules;

export let hmsPeersCache: HMSPeersCache | undefined;

export const getHmsPeersCache = () => {
  return hmsPeersCache;
};

export const setHmsPeersCache = (_hmsPeersCache: HMSPeersCache) => {
  hmsPeersCache = _hmsPeersCache;
};

export const clearHmsPeersCache = () => {
  if (hmsPeersCache) {
    hmsPeersCache.cleanup();
  }
  hmsPeersCache = undefined;
};

export type HMSPeerCacheProps = Partial<
  Pick<
    HMSPeer,
    | 'customerUserID'
    | 'metadata'
    | 'role'
    | 'audioTrack'
    | 'videoTrack'
    | 'auxiliaryTracks'
  >
>;

export class HMSPeersCache {
  private _data = new Map<string, HMSPeerCacheProps>();
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getProperty<T extends keyof HMSPeerCacheProps>(
    peerId: string,
    property: T
  ): [HMSPeerCacheProps[T], boolean] {
    const peerObj = this._data.get(peerId);

    if (peerObj && property in peerObj) {
      return [peerObj[property], true];
    }

    const value = getPeerPropertyFromNative(this.id, peerId, property);

    if (!peerObj) {
      this._data.set(peerId, { [property]: value });
    } else {
      peerObj[property] = value;
    }

    return [value, false];
  }

  updatePeerCache(
    peerId: string,
    data: Record<string, any>,
    updateType?: HMSPeerUpdate | HMSTrackUpdate,
  ) {
    const peerObj = this._data.get(peerId);

    if (updateType === HMSPeerUpdate.PEER_LEFT) {
      this._data.delete(peerId);
      return;
    }

    let updatedObj = { ...peerObj };

    if (updateType === HMSTrackUpdate.TRACK_ADDED) {
      const track = data.track as HMSTrack;

      if (track.source === HMSTrackSource.REGULAR) {
        if (track.type === HMSTrackType.VIDEO) {
          updatedObj.videoTrack = { ...track, isDegraded: false };
        } else if (track.type === HMSTrackType.AUDIO) {
          updatedObj.audioTrack = track;
        }
      }
      else {
        if (Array.isArray(updatedObj.auxiliaryTracks)) {
          updatedObj.auxiliaryTracks.push(track);
        } else {
          updatedObj.auxiliaryTracks = [track];
        }
      }
    }
    else if (updateType === HMSTrackUpdate.TRACK_REMOVED) {

      const track = data.track as HMSTrack;

      if (track.source === HMSTrackSource.REGULAR) {
        if (track.type === HMSTrackType.VIDEO) {
          updatedObj.videoTrack = undefined;
        } else if (track.type === HMSTrackType.AUDIO) {
          updatedObj.audioTrack = undefined;
        }
      }
      else if (Array.isArray(updatedObj.auxiliaryTracks)) {
        updatedObj = {
          ...updatedObj,
          auxiliaryTracks: updatedObj.auxiliaryTracks.filter(auxiliaryTrack => auxiliaryTrack.trackId !== track.trackId)
        };
      }
    }
    else if (updateType === HMSTrackUpdate.TRACK_MUTED || updateType === HMSTrackUpdate.TRACK_UNMUTED) {

      const track = data.track as HMSTrack;

      if (track.source === HMSTrackSource.REGULAR) {
        if (track.type === HMSTrackType.VIDEO) {
          updatedObj.videoTrack = { ...track, isDegraded: updatedObj.videoTrack?.isDegraded || false };
        } else if (track.type === HMSTrackType.AUDIO) {
          updatedObj.audioTrack = track;
        }
      }
      else {
        if (Array.isArray(updatedObj.auxiliaryTracks)) {
          updatedObj = {
            ...updatedObj,
            auxiliaryTracks: updatedObj.auxiliaryTracks.map(auxiliaryTrack => auxiliaryTrack.trackId === track.trackId ? track : auxiliaryTrack),
          };
        } else {
          updatedObj.auxiliaryTracks = [track];
        }
      }
    }
    else if (updateType === HMSTrackUpdate.TRACK_DEGRADED || updateType === HMSTrackUpdate.TRACK_RESTORED) {

      const track = data.track as HMSTrack;

      if (track.source === HMSTrackSource.REGULAR) {
        if (track.type === HMSTrackType.VIDEO) {
          updatedObj.videoTrack = { ...track, isDegraded: updateType === HMSTrackUpdate.TRACK_DEGRADED };
        } else if (track.type === HMSTrackType.AUDIO) {
          updatedObj.audioTrack = track;
        }
      }
      else {
        if (Array.isArray(updatedObj.auxiliaryTracks)) {
          updatedObj = {
            ...updatedObj,
            auxiliaryTracks: updatedObj.auxiliaryTracks.map(auxiliaryTrack => {
              if (auxiliaryTrack.trackId === track.trackId) {
                return { ...auxiliaryTrack, isDegraded: updateType === HMSTrackUpdate.TRACK_DEGRADED }
              }

              return auxiliaryTrack;
            }),
          };
        } else {
          updatedObj.auxiliaryTracks = [track];
        }
      }
    }
    else {
      updatedObj = { ...data };
    }

    if (Object.keys(updatedObj).length > 0) {
      this._data.set(peerId, updatedObj);
    }
  }

  cleanup() {
    this._data.clear();
  }
}

export function getPeerPropertyFromNative<T extends keyof HMSPeerCacheProps>(id: string, peerId: string, property: T) {
  const data: undefined | Record<string, any> = HMSManager.getPeerProperty({
    id,
    peerId,
    property,
  });

  let value;

  if (property === 'role') {
    value = data ? HMSEncoder.encodeHmsRole(data.role) : undefined;
  }
  else if (property === 'audioTrack') {
    value = data
      ? HMSEncoder.encodeHmsAudioTrack(data.audioTrack, id)
      : undefined;
  }
  else if (property === 'videoTrack') {
    value = data
      ? HMSEncoder.encodeHmsVideoTrack(data.videoTrack, id)
      : undefined;
  }
  else if (property === 'auxiliaryTracks') {
    value =
      data && Array.isArray(data.auxiliaryTracks)
        ? HMSEncoder.encodeHmsAuxiliaryTracks(data.auxiliaryTracks, id)
        : undefined;
  }
  else {
    value = data ? data[property] : undefined;
  }

  return value;
}
