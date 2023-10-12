// import type { HMSException } from "./HMSException";
import type { HMSPeer } from './HMSPeer';
import HMSManagerModule from './HMSManagerModule';
import { HMSEncoder, logger } from '@100mslive/react-native-hms';
import { HMSConstants } from './HMSConstants';
import { getHmsPeersCache } from './HMSPeersCache';

export class HMSPeerListIterator {
  private readonly uniqueId: string;
  private _totalCount: number = 0;

  get totalCount() {
    return this._totalCount;
  }

  constructor(uniqueId: string, totalCount: number) {
    this.uniqueId = uniqueId;
    this._totalCount = totalCount;
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
      const { totalCount, peers } = await HMSManagerModule.peerListIteratorNext({
        id: HMSConstants.DEFAULT_SDK_ID,
        uniqueId: this.uniqueId,
      });

      this._totalCount = totalCount;

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
