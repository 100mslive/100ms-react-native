import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { HMSVideoViewMode } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import { VideoView } from './VideoView';
import { AvatarView } from './AvatarView';
import type { RootState } from '../../redux';
import { PeerMetadata } from './PeerMetadata';
import { PeerAudioMutedIndicator } from './PeerAudioMutedIndicator';
import { PressableIcon } from '../PressableIcon';
import { ThreeDotsIcon } from '../../Icons';
import { COLORS } from '../../utils/theme';
import { PeerNameAndNetwork } from './PeerNameAndNetwork';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { UnmountAfterDelay } from '../UnmountAfterDelay';

export interface PeerVideoTileViewProps {
  onMinimizePress?: () => void;
  insetMode?: boolean;
}

export const _PeerVideoTileView: React.FC<PeerVideoTileViewProps> = ({
  insetMode = false,
  onMinimizePress,
}) => {
  const [mounted, setMounted] = React.useState(true);
  const localPeer = useSelector((state: RootState) => state.hmsStates.localPeer);

  const show = () => {
    setMounted(true);
  }

  const hide = () => {
    setMounted(false);
  }

  if (!localPeer) {
    return null;
  }

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

      {insetMode ? (
        <UnmountAfterDelay visible={mounted} onUnmount={hide}>
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <PressableIcon style={styles.iconWrapper} border={false} onPress={onMinimizePress}>
              <ThreeDotsIcon stack='vertical' style={styles.icon} />
            </PressableIcon>
          </Animated.View>
        </UnmountAfterDelay>
      ) : (
        <PressableIcon style={styles.iconWrapper} border={false}>
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
  }
});

export const PeerVideoTileView = React.memo(_PeerVideoTileView);
