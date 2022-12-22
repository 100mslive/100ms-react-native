import React from 'react';
import {View, Text, StyleProp, ViewStyle, Pressable} from 'react-native';
import { HMSTrackSource, HMSTrackType } from '@100mslive/react-native-hms';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

import {CustomButton} from '../../components';
import {styles} from './styles';
import type {RootState} from '../../redux';
import PeerDisplayView, { PeerDisplayViewProps } from './PeerDisplayView';

interface DisplayTrackProps extends PeerDisplayViewProps  {
  // layout?: LayoutParams;
  // miniView?: boolean;
  // peerTrackNode: PeerTrackNode;
  videoStyles: StyleProp<ViewStyle>;
  onPeerTileLongPress(): void;
};

const DisplayTrack = ({
  // layout,
  // miniView,
  // peerTrackNode,
  isDegraded,
  isLocal,
  peer,
  videoTrack,
  videoStyles,
  onPeerTileLongPress,
}: DisplayTrackProps) => {
  // hooks
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  // functions
  const onEndScreenSharePress = () => {
    hmsInstance
      ?.stopScreenshare()
      .then(d => console.log('Stop Screenshare Success: ', d))
      .catch(e => console.log('Stop Screenshare Error: ', e));
  };

  return (
    <View style={videoStyles}>
      {isLocal &&
      videoTrack?.source === HMSTrackSource.SCREEN &&
      videoTrack?.type === HMSTrackType.VIDEO ? (
        <Pressable onLongPress={onPeerTileLongPress} style={styles.screenshareContainer}>
          <MaterialCommunityIcons
            name="monitor-share"
            style={styles.icon}
            size={48}
          />
          <Text style={styles.screenshareText}>
            You are sharing your screen
          </Text>
          <CustomButton
            title="X   Stop Screenshare"
            onPress={onEndScreenSharePress}
            viewStyle={styles.screenshareButton}
            textStyle={styles.roleChangeModalButtonText}
          />
        </Pressable>
      ) : (
        <>
          <PeerDisplayView
            peer={peer}
            isDegraded={isDegraded}
            isLocal={isLocal}
            videoTrack={videoTrack}
          />

          <Pressable
            onLongPress={onPeerTileLongPress}
            style={styles.tilePressableView}
          />
        </>
      )}
      <View style={styles.peerNameContainer}>
        <Text numberOfLines={2} style={styles.peerName}>
          {videoTrack?.source !== undefined &&
          videoTrack?.source !== HMSTrackSource.REGULAR
            ? `${peer.name}'s ${videoTrack.source}`
            : isLocal
            ? `You (${peer.name})`
            : peer.name}
        </Text>
      </View>
    </View>
  );
};

export {DisplayTrack};
