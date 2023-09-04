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
  ({ peerTrackNodes, handlePeerTileMorePress }, gridViewRef) => {
    const isPortrait = useIsPortraitOrientation();

    const isPipModeActive = useSelector(
      (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
    );

    // State to track active spotlight trackId
    const spotlightTrackId = useSelector(
      (state: RootState) => state.user.spotlightTrackId
    );

    const screenshareTilesAvailable = useSelector(
      (state: RootState) => state.app.screensharePeerTrackNodes.length > 0
    );

    const pairedPeers = useMemo(
      () =>
        pairData(
          peerTrackNodes,
          isPortrait
            ? screenshareTilesAvailable
              ? MaxTilesInOnePage.IN_PORTRAIT_WITH_SCREENSHARES
              : MaxTilesInOnePage.IN_PORTRAIT
            : MaxTilesInOnePage.IN_LANDSCAPE,
          spotlightTrackId
        ),
      [peerTrackNodes, screenshareTilesAvailable, spotlightTrackId, isPortrait]
    );

    const showWelcomeBanner = useSelector(
      (state: RootState) =>
        !state.app.localPeerTrackNode && pairedPeers.length === 0
    );

    if (showWelcomeBanner) {
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

    const hasPublishPermissions = useSelector(
      (state: RootState) => {
        return state.app.localPeerTrackNode?.peer.role?.publishSettings?.allowed &&
          (state.app.localPeerTrackNode?.peer.role?.publishSettings?.allowed?.length > 0);
      }
    );

    if (!hasPublishPermissions) {
      return null;
    }

    return (
      <LocalPeerRegularVideoView onMoreOptionsPress={handlePeerTileMorePress} />
    );
  }
);
