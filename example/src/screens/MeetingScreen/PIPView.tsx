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

type PIPViewProps = {
  pairedPeers: PeerTrackNode[][];
};

const PIPView: React.FC<PIPViewProps> = ({ pairedPeers }) => {
  const preferedPeerTrack = getTrackForPIPView(pairedPeers);
  const isPreferedPeerTrackScreenShare = preferedPeerTrack && preferedPeerTrack.track && preferedPeerTrack.track.source !== 'regular'; // Screen Share Track

  // Render remote screen share is it is available
  if (isPreferedPeerTrackScreenShare) {
    return (
      <DisplayTrack
        isLocal={preferedPeerTrack?.peer?.isLocal}
        peerName={preferedPeerTrack?.peer?.name}
        videoTrack={preferedPeerTrack?.track}
        videoStyles={styles.generalTile}
        isDegraded={preferedPeerTrack?.isDegraded}
      />
    )
  }

  // otherwise render active speaker or available peertrack
  return <PIPActiveSpeakerPeerTrack pairedPeers={pairedPeers} nonActiveSpeaker={preferedPeerTrack}  />
};

interface PIPActiveSpeakerPeerTrackProps {
  pairedPeers: PeerTrackNode[][];
  nonActiveSpeaker: PeerTrackNode | null
}

const PIPActiveSpeakerPeerTrack: React.FC<PIPActiveSpeakerPeerTrackProps> = ({ pairedPeers, nonActiveSpeaker }) => {
  const activeSpeaker = useFirstActiveSpeaker();

  let peerTrackToUse = nonActiveSpeaker;

  // Active Speaker should be remote, Ignore local active speaker
  if (activeSpeaker && !activeSpeaker.peer.isLocal) {
    // getting PeerTrack of active speaker from pairedPeers
    const activeSpeakerPeerTrack = getPeerTrackNodeFromPairedPeers(pairedPeers, activeSpeaker.peer);

    if (!activeSpeakerPeerTrack) {
      throw new Error('Active Speaker not found in pairedPeers!');
    }

    peerTrackToUse = activeSpeakerPeerTrack;
  }

  if (!peerTrackToUse) {
    return null;
  }

  return (
    <DisplayTrack
      isLocal={peerTrackToUse?.peer?.isLocal}
      peerName={peerTrackToUse?.peer?.name}
      videoTrack={peerTrackToUse?.track}
      videoStyles={styles.generalTile}
      isDegraded={peerTrackToUse?.isDegraded}
    />
  );
};


export default PIPView;
