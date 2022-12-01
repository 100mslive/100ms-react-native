import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';

import { styles } from './styles';

import {getInitials} from '../../utils/functions';
import type {RootState} from '../../redux';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peerName: string;
  videoTrack?: HMSVideoTrack;
};

const PeerDisplayView = ({
  isDegraded,
  isLocal,
  peerName,
  videoTrack,
}: PeerDisplayViewProps) => {
  const HmsView = useSelector((state: RootState) => state.user.hmsInstance?.HmsView || null);
  const mirrorLocalVideo = useSelector((state: RootState) => state.user.mirrorLocalVideo);

  if (!HmsView) {
    return null;
  }

  return (
    <View style={peerDisplayViewStyles.container}>
      {videoTrack?.isMute() || videoTrack?.trackId === undefined ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(peerName)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          <HmsView
            // setZOrderMediaOverlay={miniView}
            trackId={videoTrack?.trackId!}
            mirror={
              isLocal && mirrorLocalVideo !== undefined
                ? mirrorLocalVideo
                : false
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
          {isDegraded && (
            <View style={styles.degradedContainer}>
              <View style={styles.avatarContainer}>
                <Text style={styles.degradedText}>Degraded</Text>
              </View>
            </View>
          )}
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
  },
});

export default PeerDisplayView;
