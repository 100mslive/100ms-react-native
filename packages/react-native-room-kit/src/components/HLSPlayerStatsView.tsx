import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHMSHLSPlayerStats } from '@100mslive/react-native-hms';

import { COLORS } from '../utils/theme';

export interface HLSPlayerStatsViewProps {
  onClosePress?: () => void;
}

export const HLSPlayerStatsView: React.FC<HLSPlayerStatsViewProps> = ({
  onClosePress,
}) => {
  const { stats } = useHMSHLSPlayerStats();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onClosePress?.()}
        style={styles.closeButton}
      >
        <Text style={styles.text}>close</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        Bandwidth Estimate: {stats.bandWidthEstimate}
      </Text>
      <Text style={styles.text}>
        Total Bytes Loaded: {stats.totalBytesLoaded}
      </Text>
      <Text style={styles.text}>
        Buffered Duration: {stats.bufferedDuration}
      </Text>

      <Text style={styles.text}>
        Distance From Live: {stats.distanceFromLive}
      </Text>
      <Text style={styles.text}>
        Dropped Frame Count: {stats.droppedFrameCount}
      </Text>

      <Text style={styles.text}>Average Bitrate: {stats.averageBitrate}</Text>

      <Text style={styles.text}>Video Height: {stats.videoHeight}</Text>
      <Text style={styles.text}>Video Width: {stats.videoWidth}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.OVERLAY,
    borderRadius: 12,
    padding: 8,
    minWidth: '50%',
  },
  closeButton: {
    padding: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 14 * 1.3,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
