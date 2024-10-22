import * as React from 'react';
import type {
  HMSPollQuestionOption,
  HMSPollQuestionResponse,
} from '@100mslive/react-native-hms';
import { StyleSheet, Text, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

interface PollResponseProgressViewProps {
  option: HMSPollQuestionOption;
  totalVotes: number;
  myResponse?: HMSPollQuestionResponse;
}

export const PollResponseProgressView: React.FC<
  PollResponseProgressViewProps
> = ({ option, totalVotes, myResponse }) => {
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

  const voteCount =
    option.voteCount || myResponse !== undefined
      ? option.voteCount > 1
        ? option.voteCount
        : 1
      : undefined;
  const voteText = voteCount
    ? `${voteCount} vote${voteCount > 1 ? 's' : ''}`
    : undefined;
  totalVotes = myResponse !== undefined ? totalVotes + 1 : totalVotes;

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

        {option.voteCount > 0 && (
          <Text
            style={[styles.smallText, hmsRoomStyles.surfaceHighRegularText]}
          >
            {voteText}
          </Text>
        )}
      </View>

      <View style={[hmsRoomStyles.progressContainer, styles.progressContainer]}>
        <View
          style={[
            hmsRoomStyles.progress,
            styles.progress,
            { width: `${((voteCount ? voteCount : 0) / totalVotes) * 100}%` },
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
