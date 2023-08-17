import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { MicIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';

export interface PeerAudioMutedIndicatorProps {
  isMuted: boolean | undefined;
}

export const PeerAudioMutedIndicator: React.FC<
  PeerAudioMutedIndicatorProps
> = ({ isMuted }) => {
  const iconWrapperStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.secondary_dim,
  }));

  if (isMuted) {
    return (
      <View style={[styles.iconWrapper, iconWrapperStyles]}>
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
    borderRadius: 16,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
