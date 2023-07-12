import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {HMSTrackSource} from '@100mslive/react-native-hmslive';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {HMSView} from '@100mslive/react-native-hmslive';

import {styles} from './styles';

import {parseMetadata} from '../utils/functions';
import {DisplayTrack} from './DisplayTrack';
import {COLORS} from '../utils/theme';
import type {PeerTrackNode} from '../utils/types';
import {useIsPortraitOrientation} from '../utils/dimension';

interface TileProps {
  totalTilesInContainer: number;
  peerTrackNode: PeerTrackNode;
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
}

const TileUnmemoized: React.FC<TileProps> = ({
  onPeerTileMorePress,
  peerTrackNode,
  totalTilesInContainer,
  setHmsViewRefs,
}) => {
  const isPortraitOrientation = useIsPortraitOrientation();
  const parsedMetadata = parseMetadata(peerTrackNode?.peer?.metadata);

  const oneTileStyle = {width: '100%', height: '100%'};
  const twoTileStyle = {width: '100%', height: '50%'};
  const threeTileStyle = {width: '100%', height: '33.3333%'};
  const fourTileStyle = {width: '50%', height: '50%'};

  const oneTileStyleLandscape = {width: '100%', height: '100%'};
  const twoTileStyleLandscape = {width: '50%', height: '100%'};
  const threeTileStyleLandscape = {width: '33.3333%', height: '100%'};
  const fourTileStyleLandscape = {width: '50%', height: '50%'};

  return (
    <View
      style={[
        {borderWidth: 1},
        peerTrackNode?.track?.source !== undefined &&
        peerTrackNode?.track?.source !== HMSTrackSource.REGULAR
          ? styles.gridTile
          : isPortraitOrientation
          ? totalTilesInContainer === 1
            ? oneTileStyle
            : totalTilesInContainer === 2
            ? twoTileStyle
            : totalTilesInContainer === 3
            ? threeTileStyle
            : fourTileStyle
          : totalTilesInContainer === 1
          ? oneTileStyleLandscape
          : totalTilesInContainer === 2
          ? twoTileStyleLandscape
          : totalTilesInContainer === 3
          ? threeTileStyleLandscape
          : fourTileStyleLandscape,
      ]}
    >
      <DisplayTrack
        // saving HmsView ref in collection with uniqueId as key
        ref={ref => setHmsViewRefs(peerTrackNode.id, ref)}
        isLocal={peerTrackNode?.peer?.isLocal}
        peer={peerTrackNode?.peer}
        videoTrack={peerTrackNode?.track}
        videoStyles={styles.generalTile}
        isDegraded={peerTrackNode?.isDegraded}
      />

      {/* More Options button for Peer */}
      <View style={styles.morePeerOptionsContainer}>
        <TouchableOpacity
          onPress={() => onPeerTileMorePress(peerTrackNode)}
          style={{
            padding: 8,
            backgroundColor: COLORS.SECONDARY.DISABLED,
            borderRadius: 18,
          }}
        >
          <Feather name="more-horizontal" style={styles.mic} size={20} />
        </TouchableOpacity>
      </View>

      {peerTrackNode?.peer?.audioTrack?.isMute() && (
        <View style={styles.micContainer}>
          <Feather name="mic-off" style={styles.mic} size={20} />
        </View>
      )}
      {parsedMetadata?.isBRBOn ? (
        <View style={styles.status}>
          <View style={styles.brbOnContainer}>
            <Text style={styles.brbOn}>BRB</Text>
          </View>
        </View>
      ) : null}
      {parsedMetadata?.isHandRaised ? (
        <View style={styles.status}>
          <Ionicons
            name="hand-left"
            style={{color: COLORS.TWIN.YELLOW}}
            size={20}
          />
        </View>
      ) : null}
    </View>
  );
};

const Tile = React.memo(TileUnmemoized);

Tile.displayName = 'Tile';

export {Tile};
