import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';
import type {HMSView} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {getInitials} from '../../utils/functions';
import type {RootState} from '../../redux';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peerName: string;
  videoTrack?: HMSVideoTrack;
}

const PeerDisplayView = React.forwardRef<typeof HMSView, PeerDisplayViewProps>(
  ({isDegraded, isLocal, peerName, videoTrack}, hmsViewRef) => {
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
              <Text style={styles.avatarText}>{getInitials(peerName)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.flex}>
            <HmsView
              ref={hmsViewRef}
              // setZOrderMediaOverlay={miniView}
              trackId={videoTrack?.trackId!}
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
  },
);

PeerDisplayView.displayName = 'PeerDisplayView';

const peerDisplayViewStyles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});

export default PeerDisplayView;
