import * as React from 'react';

import type { PeerTrackNode } from '../utils/types';

import PeerDisplayView from './PeerDisplayView';
import { getTrackForPIPView } from '../utils/functions';

type PIPViewProps = {
  pairedPeers: PeerTrackNode[][];
};

const PIPView: React.FC<PIPViewProps> = ({ pairedPeers }) => {
  const preferedPeerTrack = getTrackForPIPView(pairedPeers);

  // If no Peer is available
  if (!preferedPeerTrack?.peer) {
    return null;
  }

  return (
    <PeerDisplayView
      isLocal={preferedPeerTrack?.peer?.isLocal}
      peer={preferedPeerTrack?.peer}
      videoTrack={preferedPeerTrack?.track}
      isDegraded={preferedPeerTrack?.isDegraded}
    />
  );
};

export default PIPView;
