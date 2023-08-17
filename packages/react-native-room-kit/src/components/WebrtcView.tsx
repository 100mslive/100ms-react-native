import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { MaxTilesInOnePage, PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import { pairData } from '../utils/functions';
import type { RootState } from '../redux';
import { GridView } from './GridView';
import type { GridViewRefAttrs } from './GridView';
import PIPView from './PIPView';
import { useIsPortraitOrientation } from '../utils/dimension';
import { LocalPeerRegularVideoView } from './LocalPeerRegularVideoView';
import { WelcomeInMeeting } from './WelcomeInMeeting';

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
      () => pairData(
        peerTrackNodes,
        isPortrait ? MaxTilesInOnePage.IN_PORTRAIT : MaxTilesInOnePage.IN_LANDSCAPE,
        spotlightTrackId
      ),
      [peerTrackNodes, spotlightTrackId, isPortrait]
    );

    const canShowTiles = useSelector(
      (state: RootState) => !!state.app.localPeerTrackNode || pairedPeers.length > 0
    );

    if (!canShowTiles) {
      return <WelcomeInMeeting />;
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