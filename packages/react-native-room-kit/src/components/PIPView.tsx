import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { View } from 'react-native';

import type { PeerTrackNode } from '../utils/types';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { RootState } from '../redux';

type PIPViewProps = {
  peerTrackNodes: PeerTrackNode[];
  customView?: React.ReactElement | null;
};

const PIPView: React.FC<PIPViewProps> = ({ peerTrackNodes, customView }) => {
  const firstSSNode = useSelector(
    (state: RootState) => state.app.screensharePeerTrackNodes[0]
  );

  if (customView) {
    return customView;
  }

  if (firstSSNode) {
    return (
      <PeerVideoTileView key={firstSSNode.id} peerTrackNode={firstSSNode} />
    );
  }

  return <PIPPeerTiles peerTrackNodes={peerTrackNodes} />;
};

export default PIPView;

type PIPPeerTilesProps = {
  peerTrackNodes: PeerTrackNode[];
};

const PIPPeerTiles: React.FC<PIPPeerTilesProps> = ({ peerTrackNodes }) => {
  const memoDominantSpeakerIdsRef = React.useRef<string[]>([]);

  const dominantSpeakerIds = useSelector((state: RootState) => {
    return state.hmsStates.activeSpeakers
      .slice(0, 3)
      .map((speaker) => speaker.peer.peerID);
  }, shallowEqual);

  if (dominantSpeakerIds.length > 0) {
    memoDominantSpeakerIdsRef.current = dominantSpeakerIds;
  }

  const [preferredPeerTrackNodes, setPreferredPeerTrackNodes] = React.useState<
    PeerTrackNode[]
  >([]);

  React.useEffect(() => {
    setPreferredPeerTrackNodes((prevNodes) => {
      if (peerTrackNodes.length <= 3) {
        return peerTrackNodes;
      }

      const allSpeakersArePresent =
        memoDominantSpeakerIdsRef.current.length === 0 ||
        memoDominantSpeakerIdsRef.current.every(
          (speakerId) =>
            prevNodes.findIndex(
              (prevNode) => prevNode.peer.peerID === speakerId
            ) >= 0
        );

      if (prevNodes.length === 3 && allSpeakersArePresent) {
        return prevNodes;
      }

      const dominantSpeakers = getDominantSpeakers(
        memoDominantSpeakerIdsRef.current,
        peerTrackNodes
      );

      return [
        ...dominantSpeakers,
        ...peerTrackNodes.slice(0, 3 - dominantSpeakers.length),
      ];
    });
  }, [
    memoDominantSpeakerIdsRef.current,
    peerTrackNodes,
    setPreferredPeerTrackNodes,
  ]);

  if (preferredPeerTrackNodes.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'red',
      }}
    >
      {preferredPeerTrackNodes.map((node, index, arr) => {
        const isFirst = index === 0;
        const dividerWidth = arr.length > 2 ? 4 : 5;

        return (
          <>
            {isFirst ? null : <View style={{ height: '100%', width: dividerWidth }} />}

            <View style={{ flex: 1 }}>
              <PeerVideoTileView key={node.id} peerTrackNode={node} />
            </View>
          </>
        );
      })}
    </View>
  );
};

function getDominantSpeakers(
  dominantSpeakerIds: string[],
  peerTrackNodes: PeerTrackNode[]
): PeerTrackNode[] {
  let dominantSpeakerIdsCopy = dominantSpeakerIds.slice();
  const list: PeerTrackNode[] = [];

  for (const peerTrackNode of peerTrackNodes) {
    if (dominantSpeakerIdsCopy.length <= 0) {
      break;
    }

    if (dominantSpeakerIdsCopy.includes(peerTrackNode.peer.peerID)) {
      dominantSpeakerIdsCopy = dominantSpeakerIdsCopy.filter(
        (speakerId) => speakerId !== peerTrackNode.peer.peerID
      );
      list.push(peerTrackNode);
    }
  }

  return list;
}
