import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {HMSLocalAudioStats, HMSRemoteAudioStats, HMSRemoteVideoStats, HMSLocalVideoStats} from '@100mslive/react-native-hms';

import {COLORS} from '../utils/theme';

type TrackStats = HMSLocalAudioStats | HMSRemoteAudioStats | HMSRemoteVideoStats | HMSLocalVideoStats[] | null | undefined;

interface PeerRTCStatsViewProps {
  audioTrackStats: TrackStats;
  videoTrackStats: TrackStats;
}

const PeerRTCStatsView: React.FC<PeerRTCStatsViewProps> = ({
  audioTrackStats,
  videoTrackStats
}) => {
  return (
    <View>
      {videoTrackStats && 'layer' in videoTrackStats
          ? <Text style={styles.statsTitle}>{videoTrackStats.layer}</Text>
          : null}

      <Text style={styles.statsText}>
        Width{' '}
        {(videoTrackStats && 'resolution' in videoTrackStats
          ? videoTrackStats.resolution?.width
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        Height{' '}
        {(videoTrackStats && 'resolution' in videoTrackStats
          ? videoTrackStats.resolution?.height
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        FPS{' '}
        {(videoTrackStats && 'frameRate' in videoTrackStats && videoTrackStats.frameRate
          ? parseInt(videoTrackStats.frameRate.toString() ?? "0")
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        Bitrate(V){' '}
        {(videoTrackStats && 'bitrate' in videoTrackStats
          ? videoTrackStats?.bitrate?.toFixed?.(2)
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        Bitrate(A){' '}
        {(audioTrackStats && 'bitrate' in audioTrackStats
          ? audioTrackStats?.bitrate?.toFixed?.(2)
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        Jitter(V){' '}
        {(videoTrackStats && 'jitter' in videoTrackStats
          ? videoTrackStats?.jitter?.toFixed?.(2)
          : 0) ?? 0}
      </Text>
      <Text style={styles.statsText}>
        Jitter(A){' '}
        {(audioTrackStats && 'jitter' in audioTrackStats
          ? audioTrackStats?.jitter?.toFixed?.(2)
          : 0) ?? 0}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statsTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 15 * 1.3,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    lineHeight: 14 * 1.3,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});

export default PeerRTCStatsView;
