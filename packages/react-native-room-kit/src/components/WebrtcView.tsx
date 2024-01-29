import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  SafeAreaView,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

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
import { OverlayContainer } from './OverlayContainer';
import { OverlayedViews } from './OverlayedViews';
import { useFooterHeight } from './Footer';
import { useHeaderHeight } from './Header';

interface WebrtcViewProps {
  offset: SharedValue<number>;
  peerTrackNodes: Array<PeerTrackNode>;
  handlePeerTileMorePress(node: PeerTrackNode): void;
}

export const WebrtcView = React.forwardRef<GridViewRefAttrs, WebrtcViewProps>(
  ({ offset, peerTrackNodes, handlePeerTileMorePress }, gridViewRef) => {
    const isPortrait = useIsPortraitOrientation();
    const { height } = useSafeAreaFrame(); // This height does not include top & bottom safe area as this component isn't wrapped in SafeAreaView
    const footerHeight = useFooterHeight(); // This height includes top safearea by default
    const headerHeight = useHeaderHeight(); // This height includes top safearea by default
    const { top, bottom } = useSafeAreaInsets();

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

    const fullHeight = height - top - (isPortrait ? bottom : 0);
    const smallHeight = height - headerHeight - footerHeight;

    const animatedStyles = useAnimatedStyle(() => {
      return {
        height: interpolate(offset.value, [0, 1], [fullHeight, smallHeight]),
      };
    }, [fullHeight, smallHeight]);

    const headerPlaceholderAnimatedStyles = useAnimatedStyle(() => {
      return {
        height: interpolate(offset.value, [0, 1], [top, headerHeight]),
      };
    }, [headerHeight, top]);

    const overlayedAnimatedStyles = useAnimatedStyle(() => {
      return {
        bottom: interpolate(
          offset.value,
          [0, 1],
          [!isPortrait ? bottom : 0, 0]
        ),
      };
    }, [isPortrait, bottom]);

    if (isPipModeActive) {
      return (
        <PIPView
          peerTrackNodes={peerTrackNodes}
          customView={
            showWelcomeBanner ? (
              <WelcomeInMeeting />
            ) : pairedPeers.length <= 0 ? (
              <LocalPeerRegularVideoView />
            ) : null
          }
        />
      );
    }

    return (
      <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
        <Animated.View style={headerPlaceholderAnimatedStyles} />

        <Animated.View style={animatedStyles}>
          <OverlayContainer>
            {showWelcomeBanner ? (
              <WelcomeInMeeting />
            ) : pairedPeers.length > 0 ? (
              <GridView
                ref={gridViewRef}
                onPeerTileMorePress={handlePeerTileMorePress}
                pairedPeers={pairedPeers}
              />
            ) : (
              <LocalPeerRegularVideoView
                onMoreOptionsPress={handlePeerTileMorePress}
              />
            )}

            <OverlayedViews
              animatedStyle={overlayedAnimatedStyles}
              offset={offset}
            />
          </OverlayContainer>
        </Animated.View>
      </SafeAreaView>
    );
  }
);
