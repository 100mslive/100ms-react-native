import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, Text } from 'react-native';

import { styles } from './styles';

import { PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import { pairData } from '../utils/functions';
import type { RootState } from '../redux';
import { GridView } from './GridView';
import type { GridViewRefAttrs } from './GridView';
import PIPView from './PIPView';
import { useIsPortraitOrientation } from '../utils/dimension';
import { LocalPeerRegularVideoView } from './LocalPeerRegularVideoView';

interface WebrtcViewProps {
  peerTrackNodes: Array<PeerTrackNode>;
  handlePeerTileMorePress(node: PeerTrackNode): void;
}

export const WebrtcView = React.forwardRef<GridViewRefAttrs, WebrtcViewProps>(
  ({
    peerTrackNodes,
    handlePeerTileMorePress,
  }, gridViewRef) => {
    const isPortrait = useIsPortraitOrientation();

    const isPipModeActive = useSelector(
      (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
    );

    // State to track active spotlight trackId
    const spotlightTrackId = useSelector(
      (state: RootState) => state.user.spotlightTrackId
    );

    const pairedPeers = useMemo(
      () => pairData(peerTrackNodes, isPortrait ? 6 : 2, spotlightTrackId),
      [peerTrackNodes, spotlightTrackId, isPortrait]
    );

    const canShowTiles = useSelector(
      (state: RootState) => !!state.app.localPeerTrackNode || pairedPeers.length > 0
    );

    if (!canShowTiles) {
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

    return <LocalPeerRegularVideoView onMoreOptionsPress={handlePeerTileMorePress} />
  }
);
