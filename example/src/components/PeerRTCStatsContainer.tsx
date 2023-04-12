import React, { memo } from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';

import {COLORS} from '../utils/theme';
import {RootState} from '../redux';
import PeerRTCStatsView from './PeerRTCStatsView';

interface PeerRTCStatsContainerProps {
  peerId?: string;
  trackId?: string;
}

const PeerRTCStatsContainerUnmemo: React.FC<PeerRTCStatsContainerProps> = ({
  peerId,
  trackId,
}) => {
  const audioTrackStats = useSelector((state: RootState) =>
    peerId ? state.app.rtcStats[peerId] : null,
  );
  const videoTrackStats = useSelector((state: RootState) =>
    trackId ? state.app.rtcStats[trackId] : null,
  );

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
      {videoTrackStats.map(videoTrackStat => (
        <View style={styles.statsViewWrapper}>
          <PeerRTCStatsView
            key={videoTrackStat.layer}
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
    maxHeight: 170
  },
  statsViewWrapper: {
    marginBottom: 12
  }
});

const PeerRTCStatsContainer = memo(PeerRTCStatsContainerUnmemo);

PeerRTCStatsContainer.displayName = 'PeerRTCStatsContainer';

export default PeerRTCStatsContainer;
