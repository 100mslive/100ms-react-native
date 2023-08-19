import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useHMSRoomStyleSheet } from '../hooks-util';

export const HMSPreviewHLSLiveIndicator = () => {
  const isHLSStreaming = useSelector(
    (state: RootState) => state.hmsStates.room?.hlsStreamingState?.running
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.alert_error_default,
    },
    circle: {
      backgroundColor: theme.palette.on_surface_high,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  if (!isHLSStreaming) {
    return null;
  }

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <View style={styles.circleContainer}>
        <View style={[styles.circle, hmsRoomStyles.circle]} />
      </View>
      <Text style={[styles.text, hmsRoomStyles.text]}>LIVE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
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
  },
  text: {
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
