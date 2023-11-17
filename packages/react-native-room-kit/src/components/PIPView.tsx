import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { View } from 'react-native';

import type { PeerTrackNode } from '../utils/types';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';
import type { RootState } from '../redux';
import { COLORS } from '../utils/theme';

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

  if (
    dominantSpeakerIds.length > 0 &&
    anyNewDominantSpeaker(memoDominantSpeakerIdsRef.current, dominantSpeakerIds)
  ) {
    memoDominantSpeakerIdsRef.current = dominantSpeakerIds;
  }

  const preferredPeerTrackNodes = React.useMemo(() => {
    return getDominantSpeakers(
      memoDominantSpeakerIdsRef.current,
      peerTrackNodes
    );
  }, [memoDominantSpeakerIdsRef.current, peerTrackNodes]);

  if (preferredPeerTrackNodes.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.BLACK,
      }}
    >
      {preferredPeerTrackNodes.map((node, index, arr) => {
        const isFirst = index === 0;
        const dividerWidth = arr.length > 2 ? 4 : 5;

        return (
          <React.Fragment key={node.id}>
            {isFirst ? null : (
              <View style={{ height: '100%', width: dividerWidth }} />
            )}

            <View style={{ flex: 1 }}>
              <PeerVideoTileView peerTrackNode={node} />
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

function anyNewDominantSpeaker(
  oldSpeakers: string[],
  newSpeakers: string[]
): boolean {
  if (newSpeakers.length !== oldSpeakers.length) {
    return true;
  }

  const uniques = new Set([...oldSpeakers, ...newSpeakers]);

  return uniques.size > oldSpeakers.length;
}

function getDominantSpeakers(
  dominantSpeakerIds: string[],
  peerTrackNodes: PeerTrackNode[]
): PeerTrackNode[] {
  if (peerTrackNodes.length <= 3) {
    return peerTrackNodes;
  }

  const list = peerTrackNodes.slice(0, 3);

  let dominantSpeakerIdsCopy = dominantSpeakerIds.slice();

  for (let i = 3; i < peerTrackNodes.length; i++) {
    const peerTrackNode = peerTrackNodes[i];

    if (dominantSpeakerIdsCopy.length <= 0 || !peerTrackNode) {
      break;
    }

    if (dominantSpeakerIdsCopy.includes(peerTrackNode.peer.peerID)) {
      dominantSpeakerIdsCopy = dominantSpeakerIdsCopy.filter(
        (speakerId) => speakerId !== peerTrackNode.peer.peerID
      );
      list.unshift(peerTrackNode);
    }
  }

  if (list.length > 3) {
    list.length = 3;
  }

  return list;
}
