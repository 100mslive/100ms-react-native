import * as React from 'react';

import { HMSConstants } from '../classes/HMSConstants';
import { HMSEncoder } from '../classes/HMSEncoder';
import { HMSEventEmitter } from '../classes/HMSEventEmitter';
import { getLogger } from '../classes/HMSLogger';
import HMSNativeEventListener from '../classes/HMSNativeEventListener';
import type { HMSNativeEventSubscription } from '../classes/HMSNativeEventListener';
import type { HMSPeer } from '../classes/HMSPeer';
import { HMSPeerUpdate, HMSPeerUpdateOrdinals } from '../classes/HMSPeerUpdate';
import { getHmsPeersCache } from '../classes/HMSPeersCache';
import { HMSUpdateListenerActions } from '../classes/HMSUpdateListenerActions';

const eventType = HMSUpdateListenerActions.ON_PEER_UPDATE;

// TODO: How to handle events which have already been received?
// TODO(DOUBT): add HMSInstance as dependency because of actions enabling/disabling events on HMSInstance?
export const useHMSPeerUpdates = (
  effect: (data: { peer: HMSPeer; type: HMSPeerUpdate }) => void,
  deps: React.DependencyList | undefined = []
) => {
  React.useEffect(() => {
    if (HMSEventEmitter.listenerCount(eventType) <= 0) {
      addPeerUpdateSubscription();
    }

    const subscription = HMSEventEmitter.addListener(eventType, effect, null);

    return () => {
      subscription.remove();

      if (HMSEventEmitter.listenerCount(eventType) <= 0) {
        removePeerUpdateSubscription();
      }
    };
  }, deps);
};

let peerUpdateSubscription: HMSNativeEventSubscription | null = null;

function addPeerUpdateSubscription() {
  if (peerUpdateSubscription !== null) {
    return;
  }

  peerUpdateSubscription = HMSNativeEventListener.addListener(
    HMSConstants.DEFAULT_SDK_ID,
    HMSUpdateListenerActions.ON_PEER_UPDATE,
    (peerData: any) => {
      const data: { peer: any; type: any } = {
        peer: peerData,
        type: null,
      };

      for (const ordinal of HMSPeerUpdateOrdinals.keys()) {
        if (ordinal in peerData) {
          data.peer.peerID = peerData[ordinal];
          data.type = ordinal;
          break;
        }
      }

      const peer: HMSPeer = HMSEncoder.encodeHmsPeer(data.peer);
      const type = HMSEncoder.encodeHmsPeerUpdate(data.type) || data.type;

      getHmsPeersCache()?.updatePeerCache(data.peer.peerID, data.peer, type);

      getLogger()?.verbose('#Listener ON_PEER_LISTENER_CALL', {
        peer,
        type,
      });

      HMSEventEmitter.emit(eventType, { peer, type });
    }
  );
}

function removePeerUpdateSubscription() {
  if (peerUpdateSubscription === null) {
    return;
  }

  peerUpdateSubscription.remove();
  peerUpdateSubscription = null;
}
