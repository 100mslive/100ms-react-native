import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
  HMSPeer,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';

import {styles} from '../styles';

import {getInitials} from '../../../utils/functions';
import type {RootState} from '../../../redux';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peer: HMSPeer;
  videoTrack?: HMSVideoTrack;
}

const PeerDisplayView = ({
  isDegraded,
  isLocal,
  peer,
  videoTrack,
}: PeerDisplayViewProps) => {
  const HmsView = useSelector(
    (state: RootState) => state.user.hmsInstance?.HmsView || null,
  );
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera,
  );

  if (!HmsView) {
    return null;
  }

  return (
    <View style={peerDisplayViewStyles.container}>
      {videoTrack?.isMute() || videoTrack?.trackId === undefined ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(peer.name)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          {/**
           * To Render Peer Live Videos, We can use HMSView
           * For more info about its props and usage, Check out {@link https://www.100ms.live/docs/react-native/v2/features/render-video | Render Video}
           */}
          <HmsView
            trackId={videoTrack?.trackId!}
            key={videoTrack?.trackId!}
            mirror={
              isLocal && mirrorCamera !== undefined ? mirrorCamera : false
            }
            scaleType={
              videoTrack?.source !== undefined &&
              videoTrack?.source !== HMSTrackSource.REGULAR
                ? HMSVideoViewMode.ASPECT_FIT
                : HMSVideoViewMode.ASPECT_FILL
            }
            style={
              videoTrack?.source !== undefined &&
              videoTrack?.source !== HMSTrackSource.REGULAR
                ? styles.hmsViewScreen
                : styles.hmsView
            }
          />

          {/* Showing Video degradation message to viewer */}
          {isDegraded ? (
            <View style={styles.degradedContainer}>
              <View style={styles.avatarContainer}>
                <Text style={styles.degradedText}>Degraded</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const peerDisplayViewStyles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
});

export default PeerDisplayView;
