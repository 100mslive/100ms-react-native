import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import type { ViewStyle } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import type { HMSView } from '@100mslive/react-native-hms';

import { Tile } from './Tile';
import type { PeerTrackNode } from '../utils/types';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { groupIntoPairs } from '../utils/functions';
import type { RootState } from '../redux';

interface TilesContainerProps {
  peerTrackNodes: PeerTrackNode[];
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
}

const _TilesContainer: React.FC<TilesContainerProps> = ({
  peerTrackNodes,
  setHmsViewRefs,
  onPeerTileMorePress,
}) => {
  const { width: safeWidth } = useSafeAreaFrame();
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const screenshareTilesOrWhiteboardAcive = useSelector(
    (state: RootState) =>
      state.app.screensharePeerTrackNodes.length > 0 ||
      !!state.hmsStates.whiteboard
  );

  const stylesConfig = computeTileWidthAndHeight(peerTrackNodes.length, {
    isLandscapeOrientation,
    type: screenshareTilesOrWhiteboardAcive ? 'row' : 'default',
  });

  // In this layout, Tile will take as much height and width as possible
  // Width and Height of Tile are independent of each other
  const growableTileLayout = peerTrackNodes.length <= 4;

  return (
    <View
      style={[
        // If tile are growable, then we want whatever remaining space to be between them
        {
          justifyContent:
            screenshareTilesOrWhiteboardAcive && peerTrackNodes.length === 1
              ? 'center'
              : growableTileLayout
                ? 'space-between'
                : 'center',
          flexDirection: screenshareTilesOrWhiteboardAcive
            ? 'row'
            : isLandscapeOrientation
              ? 'row'
              : 'column',
        },
        { width: safeWidth },
      ]}
    >
      {peerTrackNodes.length <= 3 ? (
        // Use 1 Column Layout
        <React.Fragment>
          {peerTrackNodes.map((peerTrackNode) => {
            return (
              <Tile
                key={peerTrackNode.id}
                setHmsViewRefs={setHmsViewRefs}
                onPeerTileMorePress={onPeerTileMorePress}
                peerTrackNode={peerTrackNode}
                height={stylesConfig.height}
                width={stylesConfig.width}
                aspectRatio={stylesConfig.aspectRatio}
              />
            );
          })}
        </React.Fragment>
      ) : (
        // Use Grid Layout
        <React.Fragment>
          {groupIntoPairs(peerTrackNodes.length).map((pair, idx) => {
            const peerTrackNodesPair = pair.map(
              (nodeIndex) => peerTrackNodes[nodeIndex] as PeerTrackNode
            );
            const isFirstPairGroup = idx === 0;

            return (
              <View
                key={peerTrackNodesPair
                  .map((peerTrackNode) => peerTrackNode.id)
                  .join(',')}
                style={{
                  justifyContent:
                    peerTrackNodesPair.length === 1
                      ? 'center'
                      : 'space-between',
                  flexDirection: 'row',
                  flex: growableTileLayout ? 1 : 0,
                  marginTop: isFirstPairGroup ? 0 : 4,
                }}
              >
                {peerTrackNodesPair.map((peerTrackNode) => {
                  return (
                    <Tile
                      key={peerTrackNode.id}
                      setHmsViewRefs={setHmsViewRefs}
                      onPeerTileMorePress={onPeerTileMorePress}
                      peerTrackNode={peerTrackNode}
                      height={stylesConfig.height}
                      width={stylesConfig.width}
                      aspectRatio={stylesConfig.aspectRatio}
                    />
                  );
                })}
              </View>
            );
          })}
        </React.Fragment>
      )}
    </View>
  );
};

const TilesContainer = React.memo(_TilesContainer);

TilesContainer.displayName = 'TilesContainer';

export { TilesContainer };

// Utility Functions

const oneTileStyle = { width: '100%', height: '100%' }; // 1 Column Layout
const twoTileStyle = { width: '100%', height: '49.7222%' }; // 1 Column Layout
const threeTileStyle = { width: '100%', height: '33%' }; // 1 Column Layout

const fourTileStyle = { width: '49.5%', height: '100%' }; // Grid Layout when Width and Height has no-correlatiom
const fiveAndSixTileStyle = { width: '49.5%', aspectRatio: 1 }; // Grid Layout when width and Height as fixed aspectRatio

const oneTileStyleLandscape = { width: '100%', height: '100%' };
const twoTileStyleLandscape = { width: '49.7222%', height: '100%' };
const threeTileStyleLandscape = { width: '33%', height: '100%' };
const fourTileStyleLandscape = { width: '50%', height: '50%' };

function computeTileWidthAndHeight(
  totalTiles: number,
  config: {
    type: 'row' | 'column' | 'default';
    isLandscapeOrientation: boolean;
  }
): {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  aspectRatio?: ViewStyle['aspectRatio'];
} {
  const { type, isLandscapeOrientation } = config || {
    type: 'default',
    isLandscapeOrientation: false,
  };

  if (isLandscapeOrientation) {
    return (
      [
        oneTileStyleLandscape,
        twoTileStyleLandscape,
        threeTileStyleLandscape,
        fourTileStyleLandscape,
      ][Math.min(totalTiles - 1, 3)] || { width: '100%', height: '100%' }
    );
  }

  if (type === 'row') {
    return fiveAndSixTileStyle;
  }

  return (
    [
      oneTileStyle,
      twoTileStyle,
      threeTileStyle,
      fourTileStyle,
      fiveAndSixTileStyle,
    ][Math.min(totalTiles - 1, 4)] || { width: '100%', height: '100%' }
  );
}
