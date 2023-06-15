import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useHMSHLSPlayerStats} from '@100mslive/react-native-hms';

export interface HLSPlayerStatsViewProps {
  onClosePress?: () => void;
}

export const HLSPlayerStatsView: React.FC<HLSPlayerStatsViewProps> = ({
  onClosePress,
}) => {
  const {stats, error} = useHMSHLSPlayerStats();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onClosePress?.()}
        style={styles.closeButton}
      >
        <Text>close</Text>
      </TouchableOpacity>

      <Text>Bandwidth Estimate: {stats.bandWidthEstimate}</Text>
      <Text>Total Bytes Loaded: {stats.totalBytesLoaded}</Text>
      <Text>Buffered Duration: {stats.bufferedDuration}</Text>

      {stats.watchDuration ? (
        <Text>Watch Duration: {stats.watchDuration}</Text>
      ) : null}

      <Text>Distance From Live: {stats.distanceFromLive}</Text>
      <Text>Dropped Frame Count: {stats.droppedFrameCount}</Text>

      {stats.totalFrameCount ? (
        <Text>Total Frame Count: {stats.totalFrameCount}</Text>
      ) : null}

      <Text>Average Bitrate: {stats.averageBitrate}</Text>

      {stats.frameRate ? <Text>FrameRate: {stats.frameRate}</Text> : null}

      <Text>Video Height: {stats.videoHeight}</Text>
      <Text>Video Width: {stats.videoWidth}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'gray',
    borderRadius: 12,
    padding: 8,
    minWidth: '50%',
  },
  closeButton: {
    padding: 12,
  },
});
