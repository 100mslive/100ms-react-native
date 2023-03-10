import React from 'react';
import {View, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {HMSView} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {Tile} from './Tile';
import type {PeerTrackNode} from '../../utils/types';

interface TilesContainerProps {
  peerTrackNodes: PeerTrackNode[];
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  orientation: boolean;
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
}

const TilesContainerUnmemoized: React.FC<TilesContainerProps> = ({
  peerTrackNodes,
  orientation,
  setHmsViewRefs,
  onPeerTileMorePress,
}) => {
  const {left, right} = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.page,
        {width: Dimensions.get('window').width - left - right},
      ]}
    >
      {peerTrackNodes?.map((peerTrackNode, _idx, arr) => (
        <Tile
          key={peerTrackNode.id}
          setHmsViewRefs={setHmsViewRefs}
          onPeerTileMorePress={onPeerTileMorePress}
          orientation={orientation}
          peerTrackNode={peerTrackNode}
          totalTilesInContainer={arr.length}
        />
      ))}
    </View>
  );
};

const TilesContainer = React.memo(TilesContainerUnmemoized);

TilesContainer.displayName = 'TilesContainer';

export {TilesContainer};
