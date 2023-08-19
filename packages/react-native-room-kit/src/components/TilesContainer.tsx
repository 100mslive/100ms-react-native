import React from 'react';
import { View, Dimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HMSView } from '@100mslive/react-native-hms';

import { Tile } from './Tile';
import type { PeerTrackNode } from '../utils/types';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { groupIntoPairs } from '../utils/functions';

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
  const { left, right } = useSafeAreaInsets();
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const stylesConfig = computeTileWidthAndHeight(
    peerTrackNodes.length,
    isLandscapeOrientation
  );

  // In this layout, Tile will take as much height and width as possible
  // Width and Height of Tile are independent of each other
  const growableTileLayout = peerTrackNodes.length <= 4;

  return (
    <View
      style={[
        // If tile are growable, then we want whatever remaining space to be between them
        { justifyContent: growableTileLayout ? 'space-between' : 'center' },
        { width: Dimensions.get('window').width - left - right },
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
                  marginTop: isFirstPairGroup ? 0 : 8,
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
const twoTileStyle = { width: '100%', height: '49.4444%' }; // 1 Column Layout
const threeTileStyle = { width: '100%', height: '32.6666%' }; // 1 Column Layout

const fourTileStyle = { width: '49%', height: '100%' }; // Grid Layout when Width and Height has no-correlatiom
const fiveAndSixTileStyle = { width: '49%', aspectRatio: 1 }; // Grid Layout when width and Height as fixed aspectRatio

const oneTileStyleLandscape = { width: '100%', height: '100%' };
const twoTileStyleLandscape = { width: '50%', height: '100%' };
const threeTileStyleLandscape = { width: '33.3333%', height: '100%' };
const fourTileStyleLandscape = { width: '50%', height: '50%' };

function computeTileWidthAndHeight(
  totalTiles: number,
  isLandscapeOrientation: boolean
): {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  aspectRatio?: ViewStyle['aspectRatio'];
} {
  return (
    (isLandscapeOrientation
      ? [
          oneTileStyleLandscape,
          twoTileStyleLandscape,
          threeTileStyleLandscape,
          fourTileStyleLandscape,
        ][Math.min(totalTiles - 1, 3)]
      : [
          oneTileStyle,
          twoTileStyle,
          threeTileStyle,
          fourTileStyle,
          fiveAndSixTileStyle,
        ][Math.min(totalTiles - 1, 4)]) || { width: '100%', height: '100%' }
  );
}
