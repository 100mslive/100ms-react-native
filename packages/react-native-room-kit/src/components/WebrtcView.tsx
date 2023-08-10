import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text } from 'react-native';

import { styles } from './styles';

import { PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import { pairData } from '../utils/functions';
import type { RootState } from '../redux';
import { GridView, type GridViewRefAttrs } from './GridView';
import PIPView from './PIPView';
import { useIsPortraitOrientation } from '../utils/dimension';
import { useCanPublishVideo } from '../hooks-sdk';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';

interface WebrtcViewProps {
  peerTrackNodes: Array<PeerTrackNode>;
  handlePeerTileMorePress(node: PeerTrackNode): void;
}

export const WebrtcView = React.forwardRef<GridViewRefAttrs, WebrtcViewProps>(
  ({
    peerTrackNodes,
    handlePeerTileMorePress,
  }, gridViewRef) => {
    const isPipModeActive = useSelector(
      (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
    );

    // State to track active spotlight trackId
    const spotlightTrackId = useSelector(
      (state: RootState) => state.user.spotlightTrackId
    );

    const isPortrait = useIsPortraitOrientation();

    const pairedPeers = useMemo(
      () => pairData(peerTrackNodes, isPortrait ? 4 : 2, spotlightTrackId),
      [peerTrackNodes, spotlightTrackId, isPortrait]
    );

    const canPublishVideo = useCanPublishVideo();

    const showTiles = canPublishVideo || pairedPeers.length > 0;

    if (!showTiles) {
      return (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeHeading}>Welcome!</Text>
          <Text style={styles.welcomeDescription}>
            You're the first one here.
          </Text>
          <Text style={styles.welcomeDescription}>
            Sit back and relax till the others join.
          </Text>
        </View>
      );
    }

    if (isPipModeActive) {
      return <PIPView pairedPeers={pairedPeers} />;
    }

    if (pairedPeers.length > 0) {
      return (
        <GridView
          ref={gridViewRef}
          onPeerTileMorePress={handlePeerTileMorePress}
          pairedPeers={pairedPeers}
        />
      );
    }

    return <PeerVideoTileView />;
  }
);
