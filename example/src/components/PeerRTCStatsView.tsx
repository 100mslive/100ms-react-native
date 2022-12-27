import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import {COLORS} from '../utils/theme';
import {RootState} from '../redux';

interface PeerRTCStatsViewProps {
  peerId?: string;
  trackId?: string;
}

const PeerRTCStatsView: React.FC<PeerRTCStatsViewProps> = ({
  peerId,
  trackId,
}) => {
  const audioTrackStats = useSelector((state: RootState) =>
    peerId ? state.app.rtcStats[peerId] : null,
  );
  const videoTrackStats = useSelector((state: RootState) =>
    trackId ? state.app.rtcStats[trackId] : null,
  );

  return (
    <View style={styles.statsContainer}>
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
        {(videoTrackStats &&
        'frameRate' in videoTrackStats &&
        videoTrackStats.frameRate
          ? parseInt(videoTrackStats.frameRate.toString() ?? '0')
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
  statsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4,
    backgroundColor: COLORS.OVERLAY,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 14,
    lineHeight: 14 * 1.3,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});

export default PeerRTCStatsView;
