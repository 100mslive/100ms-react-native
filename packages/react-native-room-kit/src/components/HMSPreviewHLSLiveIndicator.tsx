import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';

export const HMSPreviewHLSLiveIndicator = () => {
  const isHLSStreaming = useSelector(
    (state: RootState) => state.hmsStates.room?.hlsStreamingState?.running
  );

  if (!isHLSStreaming) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <View style={styles.circle} />
      </View>
      <Text style={styles.text}>LIVE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.ALERT.ERROR.DEFAULT,
    paddingLeft: 8,
    paddingRight: 12,
    marginRight: 8,
  },
  circleContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.WHITE,
  },
  text: {
    marginLeft: 4,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
