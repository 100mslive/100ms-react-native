import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSTrackSource } from '@100mslive/react-native-hms';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import PeerRTCStatsView from './PeerRTCStatsView';

interface PeerRTCStatsContainerProps {
  peerId: string;
  trackId?: string;
  trackSource?: string | number;
}

const PeerRTCStatsContainerUnmemo: React.FC<PeerRTCStatsContainerProps> = ({
  peerId,
  trackId,
  trackSource,
}) => {
  const audioTrackStats = useSelector((state: RootState) => {
    const audioStatsId =
      !trackSource || trackSource === HMSTrackSource.REGULAR
        ? peerId
        : peerId + trackSource;
    return audioStatsId ? state.app.rtcStats[audioStatsId] : null;
  });
  const videoTrackStats = useSelector((state: RootState) => {
    const videoStats = trackId ? state.app.rtcStats[trackId] : null;

    if (Array.isArray(videoStats) && videoStats.length === 1) {
      return videoStats[0];
    }
    return videoStats;
  });

  if (!Array.isArray(videoTrackStats)) {
    return (
      <View style={styles.statsContainer}>
        <PeerRTCStatsView
          audioTrackStats={audioTrackStats}
          videoTrackStats={videoTrackStats}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.statsContainer}>
      {videoTrackStats.map((videoTrackStat) => (
        <View style={styles.statsViewWrapper} key={videoTrackStat.layer}>
          <PeerRTCStatsView
            audioTrackStats={audioTrackStats}
            videoTrackStats={videoTrackStat}
          />
        </View>
      ))}
    </ScrollView>
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
    minWidth: 124,
    maxHeight: 170,
  },
  statsViewWrapper: {
    marginBottom: 12,
  },
});

const PeerRTCStatsContainer = memo(PeerRTCStatsContainerUnmemo);

PeerRTCStatsContainer.displayName = 'PeerRTCStatsContainer';

export default PeerRTCStatsContainer;
