import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
  HMSPeer,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';
import type {HMSView} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {getInitials} from '../../utils/functions';
import type {RootState} from '../../redux';
import PeerRTCStatsView from '../../components/PeerRTCStatsView';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peer: HMSPeer;
  videoTrack?: HMSVideoTrack;
}

const PeerDisplayViewUnmemoized = React.forwardRef<
  typeof HMSView,
  PeerDisplayViewProps
>(({isDegraded, isLocal, peer, videoTrack}, hmsViewRef) => {
  const HmsView = useSelector(
    (state: RootState) => state.user.hmsInstance?.HmsView || null,
  );
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera,
  );
  const showStatsOnTiles = useSelector(
    (state: RootState) => state.app.joinConfig.showStats
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

      {showStatsOnTiles ? (
        <PeerRTCStatsView
          trackId={videoTrack?.trackId}
          peerId={peer.peerID}
        />
      ) : null}
    </View>
  );
});

PeerDisplayViewUnmemoized.displayName = 'PeerDisplayViewUnmemoized';

const PeerDisplayView = React.memo(PeerDisplayViewUnmemoized);

PeerDisplayView.displayName = 'PeerDisplayView';

const peerDisplayViewStyles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});

export default PeerDisplayView;
