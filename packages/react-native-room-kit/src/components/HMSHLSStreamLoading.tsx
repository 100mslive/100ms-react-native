import * as React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import { HMSLocalVideoView } from './HMSLocalVideoView';
import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';

export const HMSHLSStreamLoading = () => {
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  const { primary_default: primaryDefaultColor } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.background_dim,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    backdropContainer: {
      backgroundColor: theme.palette.background_dim
        ? hexToRgbA(theme.palette.background_dim, 0.7)
        : undefined,
    },
  }));

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      {isLocalVideoMuted ? null : <HMSLocalVideoView />}

      <View
        style={[styles.hlsLoaderContainer, hmsRoomStyles.backdropContainer]}
      >
        <ActivityIndicator
          style={styles.hlsLoader}
          size={'large'}
          color={primaryDefaultColor}
        />

        <Text style={[styles.hlsLoaderText, hmsRoomStyles.text]}>
          Starting live stream...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  hlsLoaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hlsLoader: {
    marginBottom: 30,
  },
  hlsLoaderText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
