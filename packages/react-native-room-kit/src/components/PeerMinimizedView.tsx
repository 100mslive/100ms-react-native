import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { CameraIcon, MaximizeIcon, MicIcon } from '../Icons';
import { COLORS } from '../utils/theme';
import { PressableIcon } from './PressableIcon';
import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';

export const usePeerMinimizedViewDimensions = () => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  const iconTakesSpace = 20 + 6; // Width + Right Margin
  const totalWidth = 126;
  const widthLessIconsWidth = totalWidth - (2 * iconTakesSpace);

  return {
    width: widthLessIconsWidth + (canPublishAudio ? iconTakesSpace : 0) + (canPublishVideo ? iconTakesSpace : 0),
    height: 36,
  };
}

export interface PeerMinimizedViewProps {
  onMaximizePress(): void;
}

const _PeerMinimizedView: React.FC<PeerMinimizedViewProps> = ({ onMaximizePress }) => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();
  const isLocalAudioMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalAudioMuted
  );
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  return (
    <View style={styles.container}>
      {canPublishAudio ? (
        <View style={styles.iconWrapper}>
          <MicIcon muted={!!isLocalAudioMuted} style={styles.icon} />
        </View>
      ) : null }

      {canPublishVideo ? (
        <View style={styles.iconWrapper}>
          <CameraIcon muted={!!isLocalVideoMuted} style={styles.icon} />
        </View>
      ) : null}

      <Text style={styles.name}>You</Text>

      <PressableIcon border={false} style={styles.maximizeBtn} onPress={onMaximizePress}>
        <MaximizeIcon style={styles.maximizeIcon} />
      </PressableIcon>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    borderRadius: 8,
  },
  iconWrapper: {
    padding: 2,
    marginRight: 6,
    backgroundColor: COLORS.SURFACE.BRIGHT,
    borderRadius: 4,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: COLORS.SURFACE.ON_SURFACE.HIGH,
  },
  name: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    letterSpacing: 0.25,
    marginRight: 12
  },
  maximizeBtn: {
    padding: 0
  },
  maximizeIcon: {
    width: 20,
    height: 20
  }
});

export const PeerMinimizedView = React.memo(_PeerMinimizedView);
