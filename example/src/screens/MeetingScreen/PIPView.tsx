import * as React from 'react';
import { useSelector } from 'react-redux';
import type { HMSSpeaker } from '@100mslive/react-native-hms';
import { HMSUpdateListenerActions } from '@100mslive/react-native-hms';

import { styles } from './styles';

import type { PeerTrackNode } from '../../utils/types';
import type { RootState } from '../../redux';

import { DisplayTrack } from './DisplayTrack';
import { getPeerTrackNodeFromPairedPeers, getTrackForPIPView } from '../../utils/functions';

const useFirstActiveSpeaker = (addListener = true) => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const [activeSpeaker, setActiveSpeaker] = React.useState<null | HMSSpeaker>(null);

  React.useEffect(() => {
    if (hmsInstance && addListener) {
      hmsInstance.addEventListener(
        HMSUpdateListenerActions.ON_SPEAKER,
        (speakers: HMSSpeaker[]) => {
          if (speakers[0]) {
            setActiveSpeaker(speakers[0]);
          }
        }
      );

      return () => {
        hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_SPEAKER);
      }
    }
  }, [addListener, setActiveSpeaker]);

  return activeSpeaker;
}

const usePIPTrack = (pairedPeers: PeerTrackNode[][]): PeerTrackNode | null => {
  const preferedPeerTrack = getTrackForPIPView(pairedPeers);
  const isPreferedPeerTrackScreenShare = preferedPeerTrack?.track?.source !== 'regular'; // Screen Share Track

  // we should track active speaker only when preferred track is not screen share
  const trackActiveSpeaker = isPreferedPeerTrackScreenShare === false;
  const activeSpeaker = useFirstActiveSpeaker(trackActiveSpeaker);

  let peerTrack = preferedPeerTrack;

  // Show activeSpeaker
  // 1. when it exists and
  // 2. it is remote and 
  // 3. screen share is not happening
  if (activeSpeaker && !activeSpeaker.peer.isLocal && !isPreferedPeerTrackScreenShare) {

    // getting PeerTrack of active speaker from pairedPeers
    const activeSpeakerPeerTrack = getPeerTrackNodeFromPairedPeers(pairedPeers, activeSpeaker.peer);

    if (!activeSpeakerPeerTrack) {
      throw new Error('Active Speaker not found in pairedPeers!');
    }

    // if active speaker not found in pairedPeers then create PeerTrack node for it.
    peerTrack = activeSpeakerPeerTrack;
  }

  return peerTrack;
}

type PIPViewProps = {
  pairedPeers: PeerTrackNode[][];
};

const PIPView: React.FC<PIPViewProps> = ({ pairedPeers }) => {
  const peerTrack = usePIPTrack(pairedPeers);
    
  if (!peerTrack) {
    return null;
  }

  return (
    <DisplayTrack
      isLocal={peerTrack?.peer?.isLocal}
      peerName={peerTrack?.peer?.name}
      videoTrack={peerTrack?.track}
      videoStyles={styles.generalTile}
      isDegraded={peerTrack?.isDegraded}
    />
  );
};

export default PIPView;
