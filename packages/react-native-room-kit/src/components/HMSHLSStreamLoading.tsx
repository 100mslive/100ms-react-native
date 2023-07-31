import * as React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { HMSLocalVideoView } from './HMSLocalVideoView';

export const HMSHLSStreamLoading = () => {
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  return (
    <View style={styles.container}>
      {isLocalVideoMuted ? null : <HMSLocalVideoView />}

      <View style={styles.hlsLoaderContainer}>
        <ActivityIndicator
          style={styles.hlsLoader}
          size={'large'}
          color={COLORS.PRIMARY.DEFAULT}
        />

        <Text style={styles.hlsLoaderText}>Starting live stream...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
  hlsLoaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.LOADING_BACKDROP,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hlsLoader: {
    marginBottom: 30,
  },
  hlsLoaderText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
