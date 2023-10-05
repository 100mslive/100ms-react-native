// import type { HMSException } from "./HMSException";
import type { HMSPeer } from './HMSPeer';
import HMSManagerModule from './HMSManagerModule';
import { HMSEncoder, logger } from '@100mslive/react-native-hms';
import { HMSConstants } from './HMSConstants';
import { getHmsPeersCache } from './HMSPeersCache';

export class HMSPeerListIterator {
  private readonly uniqueId: number;

  constructor(uniqueId: number) {
    this.uniqueId = uniqueId;
  }

  async hasNext(): Promise<boolean> {
    logger?.verbose('#Function HMSPeerListIterator#hasNext', this.uniqueId);
    try {
      return HMSManagerModule.peerListIteratorHasNext({
        id: HMSConstants.DEFAULT_SDK_ID,
        uniqueId: this.uniqueId,
      });
    } catch (e) {
      logger?.error('#Error in #Function HMSPeerListIterator#hasNext ', e);
      return Promise.reject(e);
    }
  }

  async next(): Promise<HMSPeer[]> {
    logger?.verbose('#Function HMSPeerListIterator#next', this.uniqueId);
    try {
      const peers = await HMSManagerModule.peerListIteratorNext({
        id: HMSConstants.DEFAULT_SDK_ID,
        uniqueId: this.uniqueId,
      });

      if (Array.isArray(peers) && peers.length > 0) {
        const hmsPeersCache = getHmsPeersCache();

        if (hmsPeersCache) {
          peers.forEach(peer => {
            hmsPeersCache.updatePeerCache(peer.peerID, peer);
          });
        }
      }

      return HMSEncoder.encodeHmsPeers(peers);
    } catch (e) {
      logger?.error('#Error in #Function HMSPeerListIterator#next ', e);
      return Promise.reject(e);
    }
  }
}
