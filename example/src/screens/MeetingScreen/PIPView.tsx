import * as React from 'react';

import type {PeerTrackNode} from '../../utils/types';

import PeerDisplayView from './PeerDisplayView';
import {getTrackForPIPView} from '../../utils/functions';

type PIPViewProps = {
  pairedPeers: PeerTrackNode[][];
};

const PIPView: React.FC<PIPViewProps> = ({pairedPeers}) => {
  const preferedPeerTrack = getTrackForPIPView(pairedPeers);

  return (
    <PeerDisplayView
      isLocal={preferedPeerTrack?.peer?.isLocal}
      peerName={preferedPeerTrack?.peer?.name}
      videoTrack={preferedPeerTrack?.track}
      isDegraded={preferedPeerTrack?.isDegraded}
    />
  );
};

export default PIPView;
