import * as React from 'react';
import type { HMSPollQuestionOption } from '@100mslive/react-native-hms';
import { StyleSheet, Text, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

interface PollResponseProgressViewProps {
  option: HMSPollQuestionOption;
  totalVotes: number;
}

export const PollResponseProgressView: React.FC<
  PollResponseProgressViewProps
> = ({ option, totalVotes }) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    progressContainer: {
      backgroundColor: theme.palette.surface_bright,
    },
    progress: {
      backgroundColor: theme.palette.primary_default,
    },
  }));

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={[styles.smallText, hmsRoomStyles.surfaceHighRegularText]}>
          {option.text}
        </Text>

        <Text style={[styles.smallText, hmsRoomStyles.surfaceHighRegularText]}>
          {option.voteCount} {option.voteCount > 1 ? 'votes' : 'vote'}
        </Text>
      </View>

      <View style={[hmsRoomStyles.progressContainer, styles.progressContainer]}>
        <View
          style={[
            hmsRoomStyles.progress,
            styles.progress,
            { width: `${(option.voteCount / totalVotes) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});
