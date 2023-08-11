import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSVideoViewMode } from '@100mslive/react-native-hms';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { VideoView } from './VideoView';
import { AvatarView } from './AvatarView';
import type { RootState } from '../../redux';
import { PeerMetadata } from './PeerMetadata';
import { PeerAudioMutedIndicator } from './PeerAudioMutedIndicator';
import { PressableIcon } from '../PressableIcon';
import { ThreeDotsIcon } from '../../Icons';
import { COLORS } from '../../utils/theme';
import { PeerNameAndNetwork } from './PeerNameAndNetwork';
import { UnmountAfterDelay } from '../UnmountAfterDelay';
import type { PeerTrackNode } from '../../utils/types';
import { createPeerTrackNode } from '../../utils/functions';

export interface PeerVideoTileViewProps {
  onMoreOptionsPress(node: PeerTrackNode): void;
  insetMode?: boolean;
}

export const _PeerVideoTileView: React.FC<PeerVideoTileViewProps> = ({
  insetMode = false,
  onMoreOptionsPress,
}) => {
  const unmountAfterDelayRef = React.useRef<React.ElementRef<typeof UnmountAfterDelay> | null>(null);
  const [mounted, setMounted] = React.useState(true);
  const localPeer = useSelector((state: RootState) => state.hmsStates.localPeer);

  const show = () => {
    setMounted(true);
    unmountAfterDelayRef.current?.resetTimer();
  }

  const hide = () => {
    setMounted(false);
  }

  if (!localPeer) {
    return null;
  }

  const handleTilePress = () => {
    show();
  }

  const handleOptionsPress = React.useCallback(() => {
    if (insetMode) {
      show();
    }
    onMoreOptionsPress(createPeerTrackNode(localPeer, localPeer?.videoTrack));
  }, [localPeer, onMoreOptionsPress, insetMode]);

  return (
    <View style={styles.container}>
      <AvatarView
        videoView={
          <VideoView
            peer={localPeer}
            trackId={localPeer.videoTrack?.trackId!}
            isDegraded={false}
            overlay={true}
            scaleType={HMSVideoViewMode.ASPECT_FILL}
          />
        }
      />

      <PeerMetadata metadata={localPeer.metadata} />

      <PeerAudioMutedIndicator isMuted={localPeer.audioTrack?.isMute()} />

      {insetMode ? null : (
        <PeerNameAndNetwork
          name={localPeer.name}
          isLocal={localPeer.isLocal}
          networkQuality={localPeer.networkQuality?.downlinkQuality}
        />
      )}

      {insetMode ? <Pressable onPress={handleTilePress} style={styles.pressable} /> : null}

      {insetMode ? (
        <UnmountAfterDelay ref={unmountAfterDelayRef} visible={mounted} onUnmount={hide}>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <PressableIcon activeOpacity={0.7} style={styles.iconWrapper} border={false} onPress={handleOptionsPress}>
              <ThreeDotsIcon stack='vertical' style={styles.icon} />
            </PressableIcon>
          </Animated.View>
        </UnmountAfterDelay>
      ) : (
        <PressableIcon activeOpacity={0.7} style={styles.iconWrapper} border={false} onPress={handleOptionsPress}>
          <ThreeDotsIcon stack='vertical' style={styles.icon} />
        </PressableIcon>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  iconWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
    backgroundColor: COLORS.BACKGROUND.DIM_64,
    borderRadius: 8,
  },
  icon: {
    width: 20,
    height: 20
  },
  pressable: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
});

export const PeerVideoTileView = React.memo(_PeerVideoTileView);
