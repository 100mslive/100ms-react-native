import React from 'react';
import type { ElementRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
  HMSPeer,
} from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';
import type { HMSView } from '@100mslive/react-native-hms';

import { styles } from './styles';

import { isTileOnSpotlight } from '../utils/functions';
import type { RootState } from '../redux';
import { AvatarView } from './AvatarView';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peer: HMSPeer;
  videoTrack?: HMSVideoTrack;
}

const PeerDisplayViewUnmemoized = React.forwardRef<
  ElementRef<typeof HMSView>,
  PeerDisplayViewProps
>(({ isDegraded, isLocal, peer, videoTrack }, hmsViewRef) => {
  const HmsView = useSelector(
    (state: RootState) => state.user.hmsInstance?.HmsView || null
  );
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast
  );
  const spotlightTrackId = useSelector(
    (state: RootState) => state.user.spotlightTrackId
  );

  if (!HmsView) {
    return null;
  }

  // Check if selected tile is "On Spotlight"
  const { onSpotlight } = isTileOnSpotlight(spotlightTrackId, {
    tileVideoTrack: videoTrack,
    peerRegularAudioTrack: peer.audioTrack,
    peerAuxTracks: peer.auxiliaryTracks,
  });

  return (
    <View style={peerDisplayViewStyles.container}>
      {videoTrack?.isMute() || videoTrack?.trackId === undefined ? (
        <View style={styles.avatarContainer}>
          <AvatarView userName={peer.name || ''} />
        </View>
      ) : (
        <View style={styles.flex}>
          <HmsView
            ref={hmsViewRef}
            // setZOrderMediaOverlay={miniView}
            trackId={videoTrack?.trackId!}
            key={videoTrack?.trackId!}
            autoSimulcast={autoSimulcast}
            mirror={
              isLocal && mirrorCamera !== undefined ? mirrorCamera : false
            }
            scaleType={
              onSpotlight ||
              (videoTrack?.source !== undefined &&
                videoTrack?.source !== HMSTrackSource.REGULAR)
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
