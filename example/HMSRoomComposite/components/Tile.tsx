import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {HMSTrackSource} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {HMSView} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {getDisplayTrackDimensions, parseMetadata} from '../utils/functions';
import {DisplayTrack} from './DisplayTrack';
import {COLORS} from '../utils/theme';
import type {PeerTrackNode} from '../utils/types';

interface TileProps {
  totalTilesInContainer: number;
  orientation: boolean;
  peerTrackNode: PeerTrackNode;
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
  setIsScreenShared: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const TileUnmemoized: React.FC<TileProps> = ({
  onPeerTileMorePress,
  peerTrackNode,
  orientation,
  totalTilesInContainer,
  setHmsViewRefs,
  setIsScreenShared,
}) => {
  const {top, bottom} = useSafeAreaInsets();
  const parsedMetadata = parseMetadata(peerTrackNode?.peer?.metadata);

  return (
    <View
      style={[
        peerTrackNode?.track?.source !== undefined &&
        peerTrackNode?.track?.source !== HMSTrackSource.REGULAR
          ? styles.gridTile
          : {
              ...getDisplayTrackDimensions(
                totalTilesInContainer,
                top,
                bottom,
                orientation,
              ),
            },
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
        setIsScreenShared={setIsScreenShared}
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
