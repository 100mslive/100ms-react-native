import HMSManager from './HMSManagerModule';

import { HMSEncoder } from './HMSEncoder';
import { HMSPeerUpdate } from './HMSPeerUpdate';
import { HMSTrackUpdate } from './HMSTrackUpdate';
import type { HMSTrack } from './HMSTrack';
import { HMSTrackType } from './HMSTrackType';
import { HMSTrackSource } from './HMSTrackSource';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';

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

export type HMSPeerCacheProps = {
  peerID?: string | undefined;
  name?: string | undefined;
  isLocal?: boolean | undefined;
  networkQuality?: HMSNetworkQuality | undefined;
  customerUserID?: string | undefined;
  metadata?: string | undefined;
  role?: HMSRole | undefined;
  audioTrack?: HMSAudioTrack | undefined;
  videoTrack?: HMSVideoTrack | undefined;
  auxiliaryTracks?: HMSTrack[] | undefined;
  isHandRaised?: boolean | undefined;
};

export class HMSPeersCache {
  private _data = new Map<string, HMSPeerCacheProps>();
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getProperty<T extends keyof HMSPeerCacheProps>(
    peerId: string,
    property: T
  ): HMSPeerCacheProps[T] | undefined {
    const peerObj = this._data.get(peerId);

    if (peerObj && property in peerObj) {
      return peerObj[property];
    }

    const encodedValue = getPeerPropertyFromNative(this.id, peerId, property);

    if (!peerObj) {
      this._data.set(peerId, { [property]: encodedValue });
    } else {
      peerObj[property] = encodedValue;
    }

    return encodedValue;
  }

  updatePeerCache(
    peerId: string,
    data: Partial<Record<keyof HMSPeerCacheProps | 'track', any>>,
    updateType?: HMSPeerUpdate | HMSTrackUpdate
  ) {
    const peerObj = this._data.get(peerId);

    if (updateType === HMSPeerUpdate.PEER_JOINED) {
      if (!peerObj) {
        this._data.set(peerId, data);
      }
      return;
    }

    if (updateType === HMSPeerUpdate.PEER_LEFT) {
      this._data.delete(peerId);
      return;
    }

    let updatedObj = peerObj || {};

    switch (updateType) {
      case HMSTrackUpdate.TRACK_ADDED: {
        const track = data.track as HMSTrack;

        if (track.source === HMSTrackSource.REGULAR) {
          if (track.type === HMSTrackType.VIDEO) {
            updatedObj.videoTrack = track;
            updatedObj.videoTrack.isDegraded = false;
          } else if (track.type === HMSTrackType.AUDIO) {
            updatedObj.audioTrack = track;
          }
        } else {
          if (Array.isArray(updatedObj.auxiliaryTracks)) {
            updatedObj.auxiliaryTracks.push(track);
          } else {
            updatedObj.auxiliaryTracks = [track];
          }
        }
        break;
      }
      case HMSTrackUpdate.TRACK_REMOVED: {
        const track = data.track as HMSTrack;

        if (track.source === HMSTrackSource.REGULAR) {
          if (track.type === HMSTrackType.VIDEO) {
            updatedObj.videoTrack = undefined;
          } else if (track.type === HMSTrackType.AUDIO) {
            updatedObj.audioTrack = undefined;
          }
        } else if (Array.isArray(updatedObj.auxiliaryTracks)) {
          updatedObj.auxiliaryTracks = updatedObj.auxiliaryTracks.filter(
            (auxiliaryTrack) => auxiliaryTrack.trackId !== track.trackId
          );
        }
        break;
      }
      case HMSTrackUpdate.TRACK_MUTED:
      case HMSTrackUpdate.TRACK_UNMUTED: {
        const track = data.track as HMSTrack;

        if (track.source === HMSTrackSource.REGULAR) {
          if (track.type === HMSTrackType.VIDEO) {
            const oldIsDegraded = updatedObj.videoTrack?.isDegraded || false;
            updatedObj.videoTrack = track;
            updatedObj.videoTrack.isDegraded = oldIsDegraded;
          } else if (track.type === HMSTrackType.AUDIO) {
            updatedObj.audioTrack = track;
          }
        } else {
          if (Array.isArray(updatedObj.auxiliaryTracks)) {
            updatedObj = {
              ...updatedObj,
              auxiliaryTracks: updatedObj.auxiliaryTracks.map(
                (auxiliaryTrack) =>
                  auxiliaryTrack.trackId === track.trackId
                    ? track
                    : auxiliaryTrack
              ),
            };
          } else {
            updatedObj.auxiliaryTracks = [track];
          }
        }
        break;
      }
      case HMSTrackUpdate.TRACK_DEGRADED:
      case HMSTrackUpdate.TRACK_RESTORED: {
        const track = data.track as HMSTrack;

        if (track.source === HMSTrackSource.REGULAR) {
          if (track.type === HMSTrackType.VIDEO) {
            updatedObj.videoTrack = track;
            updatedObj.videoTrack.isDegraded =
              updateType === HMSTrackUpdate.TRACK_DEGRADED;
          } else if (track.type === HMSTrackType.AUDIO) {
            updatedObj.audioTrack = track;
          }
        } else {
          if (Array.isArray(updatedObj.auxiliaryTracks)) {
            updatedObj.auxiliaryTracks = updatedObj.auxiliaryTracks.map(
              (auxiliaryTrack) => {
                if (auxiliaryTrack.trackId === track.trackId) {
                  return {
                    ...auxiliaryTrack,
                    isDegraded: updateType === HMSTrackUpdate.TRACK_DEGRADED,
                  };
                }

                return auxiliaryTrack;
              }
            );
          } else {
            updatedObj.auxiliaryTracks = [track];
          }
        }
        break;
      }
      case HMSPeerUpdate.ROLE_CHANGED: {
        updatedObj.role = HMSEncoder.encodeHmsRole(data.role);
        break;
      }
      case HMSPeerUpdate.NETWORK_QUALITY_UPDATED: {
        updatedObj.networkQuality = HMSEncoder.encodeHMSNetworkQuality(
          data.networkQuality
        );
        break;
      }
      case HMSPeerUpdate.METADATA_CHANGED: {
        updatedObj.metadata = data.metadata;
        break;
      }
      case HMSPeerUpdate.NAME_CHANGED: {
        updatedObj.name = data.name;
        break;
      }
      case HMSPeerUpdate.HAND_RAISED_CHANGED: {
        updatedObj.isHandRaised = data.isHandRaised;
        break;
      }
      default: {
        updatedObj = { ...updatedObj, ...data };
        break;
      }
    }

    if (Object.keys(updatedObj).length > 0) {
      this._data.set(peerId, updatedObj);
    }
  }

  cleanup() {
    this._data.clear();
  }
}

export function getPeerPropertyFromNative<T extends keyof HMSPeerCacheProps>(
  id: string,
  peerId: string,
  property: T
): HMSPeerCacheProps[T] {
  const data: any = HMSManager.getPeerProperty({
    id,
    peerId,
    property,
  });

  let value;

  if (property === 'role') {
    value = data ? HMSEncoder.encodeHmsRole(data.role) : undefined;
  } else if (property === 'networkQuality') {
    value = data
      ? HMSEncoder.encodeHMSNetworkQuality(data.networkQuality)
      : undefined;
  } else if (property === 'audioTrack') {
    value = data
      ? HMSEncoder.encodeHmsAudioTrack(data.audioTrack, id)
      : undefined;
  } else if (property === 'videoTrack') {
    value = data
      ? HMSEncoder.encodeHmsVideoTrack(data.videoTrack, id)
      : undefined;
  } else if (property === 'auxiliaryTracks') {
    value =
      data && Array.isArray(data.auxiliaryTracks)
        ? HMSEncoder.encodeHmsAuxiliaryTracks(data.auxiliaryTracks, id)
        : undefined;
  } else if (property === 'name') {
    value = data?.[property];
  }
  else {
    value = data ? data[property] : undefined;
  }

  return value;
}
