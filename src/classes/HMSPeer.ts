import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import { getHmsPeersCache, getPeerPropertyFromNative } from './HMSPeersCache';
import { HMSConstants } from './HMSConstants';

export class HMSPeer {
  peerID: string;

  constructor(params: { peerID: string }) {
    this.peerID = params.peerID;
  }

  get name(): string {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'name') || '';
    }

    return (
      getPeerPropertyFromNative(
        HMSConstants.DEFAULT_SDK_ID,
        this.peerID,
        'name'
      ) || ''
    );
  }

  get isLocal(): boolean | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'isLocal');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'isLocal'
    );
  }

  get networkQuality(): HMSNetworkQuality | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'networkQuality');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'networkQuality'
    );
  }

  get customerUserID(): string | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'customerUserID');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'customerUserID'
    );
  }

  get metadata(): string | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'metadata');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'metadata'
    );
  }

  get role(): HMSRole | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'role');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'role'
    );
  }

  get audioTrack(): HMSAudioTrack | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'audioTrack');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'audioTrack'
    );
  }

  get videoTrack(): HMSVideoTrack | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'videoTrack');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'videoTrack'
    );
  }

  get auxiliaryTracks(): HMSTrack[] | undefined {
    const hmsPeersCache = getHmsPeersCache();

    if (hmsPeersCache) {
      return hmsPeersCache.getProperty(this.peerID, 'auxiliaryTracks');
    }

    return getPeerPropertyFromNative(
      HMSConstants.DEFAULT_SDK_ID,
      this.peerID,
      'auxiliaryTracks'
    );
  }
}
