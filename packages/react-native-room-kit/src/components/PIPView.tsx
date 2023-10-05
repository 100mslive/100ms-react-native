import * as React from 'react';
import { useSelector } from 'react-redux';

import type { PeerTrackNode } from '../utils/types';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { RootState } from '../redux';

type PIPViewProps = {
  peerTrackNodes: PeerTrackNode[];
  customView?: React.ReactElement | null;
};

const PIPView: React.FC<PIPViewProps> = ({ peerTrackNodes, customView }) => {
  const memoDominantSpeakerIdRef = React.useRef<string | null>(null);

  const dominantSpeakerId = useSelector((state: RootState) => {
    const dominantSpeaker = state.hmsStates.activeSpeakers[0];

    return dominantSpeaker?.peer.peerID ?? null;
  });

  if (dominantSpeakerId) {
    memoDominantSpeakerIdRef.current = dominantSpeakerId;
  }

  if (customView) {
    return customView;
  }

  const firstPeerTrackNode = peerTrackNodes[0];

  const preferedPeerTrack =
    (memoDominantSpeakerIdRef.current
      ? peerTrackNodes.find(
          (node) => node.peer.peerID === memoDominantSpeakerIdRef.current
        )
      : firstPeerTrackNode) ?? firstPeerTrackNode;

  if (!preferedPeerTrack) {
    return null;
  }

  return (
    <PeerVideoTileView
      key={preferedPeerTrack.id}
      peerTrackNode={preferedPeerTrack}
    />
  );
};

export default PIPView;
