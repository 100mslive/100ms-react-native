import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { HMSTrackSource, HMSVideoViewMode } from '@100mslive/react-native-hms';
import type { HMSView } from '@100mslive/react-native-hms';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import { VideoView } from './VideoView';
import { AvatarView } from './AvatarView';
import type { RootState } from '../../redux';
import { PeerMetadata } from './PeerMetadata';
import { PeerAudioMutedIndicator } from './PeerAudioMutedIndicator';
import { PressableIcon } from '../PressableIcon';
import { ThreeDotsIcon } from '../../Icons';
import { hexToRgbA } from '../../utils/theme';
import { PeerNameAndNetwork } from './PeerNameAndNetwork';
import { UnmountAfterDelay } from '../UnmountAfterDelay';
import type { PeerTrackNode } from '../../utils/types';
import { isTileOnSpotlight } from '../../utils/functions';
import { selectCanPublishTrackForRole } from '../../hooks-sdk-selectors';
import { useHMSRoomStyle } from '../../hooks-util';

export interface PeerVideoTileViewProps {
  peerTrackNode: PeerTrackNode;
  onMoreOptionsPress(node: PeerTrackNode): void;
  insetMode?: boolean;
}

export const _PeerVideoTileView = React.forwardRef<
  React.ElementRef<typeof HMSView>,
  PeerVideoTileViewProps
>(({ peerTrackNode, onMoreOptionsPress, insetMode = false }, hmsViewRef) => {
  const unmountAfterDelayRef = React.useRef<React.ElementRef<
    typeof UnmountAfterDelay
  > | null>(null);
  const [mounted, setMounted] = React.useState(true);

  const onSpotlight = useSelector((state: RootState) => {
    const { onSpotlight } = isTileOnSpotlight(state.user.spotlightTrackId, {
      tileVideoTrack: peerTrackNode.track,
      peerRegularAudioTrack: peerTrackNode.peer.audioTrack,
      peerAuxTracks: peerTrackNode.peer.auxiliaryTracks,
    });

    return onSpotlight;
  });

  const show = () => {
    setMounted(true);
    unmountAfterDelayRef.current?.resetTimer();
  };

  const hide = () => {
    setMounted(false);
  };

  const handleTilePress = () => {
    show();
  };

  const handleOptionsPress = React.useCallback(() => {
    if (insetMode) {
      show();
    }
    onMoreOptionsPress(peerTrackNode);
  }, [peerTrackNode, onMoreOptionsPress, insetMode]);

  const { peer, track, isDegraded } = peerTrackNode;

  const peerCanPublishAudio = selectCanPublishTrackForRole(peer.role, 'audio');
  const peerCanPublishVideo = selectCanPublishTrackForRole(peer.role, 'video');

  const iconWrapperStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: hexToRgbA(theme.palette.background_dim, 0.64),
  }));

  return (
    <View style={styles.container}>
      <AvatarView
        name={peer.name}
        videoView={
          peerCanPublishVideo &&
          track &&
          track.trackId &&
          track.isMute() === false ? (
            <VideoView
              ref={hmsViewRef}
              peer={peer}
              trackId={track.trackId}
              isDegraded={isDegraded}
              overlay={insetMode}
              scaleType={
                onSpotlight || (track.source !== HMSTrackSource.REGULAR)
                  ? HMSVideoViewMode.ASPECT_FIT
                  : HMSVideoViewMode.ASPECT_FILL
              }
            />
          ) : null
        }
      />

      {/* Handling Peer Metadata */}
      <PeerMetadata metadata={peer.metadata} />

      {/* Handling Peer Audio Mute indicator */}
      {peerCanPublishAudio ? (
        <PeerAudioMutedIndicator isMuted={peer.audioTrack?.isMute()} />
      ) : null}

      {/* Handling showing Peer name */}
      {insetMode ? null : (
        <PeerNameAndNetwork
          name={peer.name}
          isLocal={peer.isLocal}
          trackSource={track?.source}
          networkQuality={peer.networkQuality?.downlinkQuality}
        />
      )}

      {/* Handling press on this View, currently we make 3 dots visible when pressed */}
      {insetMode ? (
        <Pressable style={styles.pressable} onPress={handleTilePress} />
      ) : null}

      {/* 3 dots option menu */}
      {insetMode ? (
        <UnmountAfterDelay
          ref={unmountAfterDelayRef}
          visible={mounted}
          onUnmount={hide}
        >
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <PressableIcon
              activeOpacity={0.7}
              style={[styles.iconWrapper, iconWrapperStyles]}
              border={false}
              onPress={handleOptionsPress}
            >
              <ThreeDotsIcon stack="vertical" style={styles.icon} />
            </PressableIcon>
          </Animated.View>
        </UnmountAfterDelay>
      ) : (
        <PressableIcon
          activeOpacity={0.7}
          style={[styles.iconWrapper, iconWrapperStyles]}
          border={false}
          onPress={handleOptionsPress}
        >
          <ThreeDotsIcon stack="vertical" style={styles.icon} />
        </PressableIcon>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
    borderRadius: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  pressable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export const PeerVideoTileView = React.memo(_PeerVideoTileView);