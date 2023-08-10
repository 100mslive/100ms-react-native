import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { MicIcon } from '../../Icons';
import { COLORS } from '../../utils/theme';

export interface PeerAudioMutedIndicatorProps {
  isMuted: boolean | undefined;
}

export const PeerAudioMutedIndicator: React.FC<
  PeerAudioMutedIndicatorProps
> = ({ isMuted }) => {
  if (isMuted) {
    return (
      <View style={styles.iconWrapper}>
        <MicIcon muted={true} style={styles.icon} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: COLORS.SECONDARY.DIM,
    borderRadius: 16,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: COLORS.SURFACE.ON_SURFACE.HIGH,
  },
});
