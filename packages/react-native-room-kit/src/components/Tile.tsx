import React from 'react';
import { useSelector } from 'react-redux';
import { View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { HMSTrackSource } from '@100mslive/react-native-hms';
import type { HMSView } from '@100mslive/react-native-hms';

import type { PeerTrackNode } from '../utils/types';
import PeerRTCStatsContainer from './PeerRTCStatsContainer';
import type { RootState } from '../redux';
import { LocalPeerScreenshareView } from './LocalPeerScreenshareView';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';

type TileProps = {
  peerTrackNode: PeerTrackNode;
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
  style?: StyleProp<ViewStyle>;
} & (
  | {
      aspectRatio?: undefined;
      width: ViewStyle['width'];
      height: ViewStyle['height'];
    }
  | {
      aspectRatio: number;
      width?: ViewStyle['width'];
      height?: ViewStyle['width'];
    }
);

const _Tile: React.FC<TileProps> = ({
  aspectRatio,
  width,
  height,
  onPeerTileMorePress,
  peerTrackNode,
  setHmsViewRefs,
  style,
}) => {
  const showStatsOnTiles = useSelector(
    (state: RootState) => state.app.joinConfig.showStats
  );

  const trackSource = peerTrackNode.track?.source;
  const isNonRegularTrack =
    trackSource && trackSource !== HMSTrackSource.REGULAR;

  return (
    <View
      style={[{ position: 'relative' }, { width, height, aspectRatio }, style]}
    >
      {isNonRegularTrack && peerTrackNode.peer.isLocal ? (
        <LocalPeerScreenshareView />
      ) : (
        <PeerVideoTileView
          ref={(ref) => setHmsViewRefs(peerTrackNode.id, ref)}
          peerTrackNode={peerTrackNode}
          onMoreOptionsPress={onPeerTileMorePress}
        />
      )}

      {showStatsOnTiles ? (
        <PeerRTCStatsContainer
          trackId={peerTrackNode.track?.trackId}
          peerId={peerTrackNode.peer.peerID}
          trackSource={peerTrackNode.track?.source}
        />
      ) : null}
    </View>
  );
};

const Tile = React.memo(_Tile);

Tile.displayName = 'Tile';

export { Tile };
