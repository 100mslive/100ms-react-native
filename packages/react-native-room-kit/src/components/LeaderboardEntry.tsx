import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import type { HMSPollLeaderboardEntry } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { CheckIcon, ClockIcon } from '../Icons';

export interface LeaderboardEntryProps {
  entry: HMSPollLeaderboardEntry;
  totalPoints: number;
  totalQuestions: number;
  style?: StyleProp<ViewStyle>;
}

export const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({
  entry,
  style,
  totalPoints,
  totalQuestions,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    semiBoldWhiteText: {
      color: '#ffffff',
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    icon: {
      tintColor: theme.palette.on_surface_medium,
    },
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.namePositionWrapper}>
        <View
          style={[
            styles.position,
            entry.position === 1
              ? styles.firstPosition
              : entry.position === 2
                ? styles.secondPosition
                : entry.position === 3
                  ? styles.thirdPosition
                  : null,
          ]}
        >
          <Text
            style={[
              styles.smallerText,
              hmsRoomStyles.semiBoldWhiteText,
              {
                textAlign: 'center',
                textAlignVertical: 'center',
              },
            ]}
          >
            {entry.position}
          </Text>
        </View>

        <View style={styles.flexShrink}>
          <Text
            numberOfLines={2}
            style={[styles.smallText, hmsRoomStyles.semiBoldHighText]}
          >
            {entry.peer?.userName}
          </Text>
          <Text style={[styles.smallerText, hmsRoomStyles.regularMediumText]}>
            {entry.score}/{totalPoints} points
          </Text>
        </View>
      </View>

      <View style={styles.scoreDurationWrapper}>
        {entry.position === 1 &&
        entry.correctResponses &&
        entry.correctResponses > 0 ? (
          <Text
            style={[
              styles.normalText,
              { marginLeft: 12 },
              hmsRoomStyles.semiBoldHighText,
            ]}
          >
            🏆
          </Text>
        ) : null}

        <View style={styles.iconWrapper}>
          <CheckIcon
            type="in-circle"
            style={[styles.icon, hmsRoomStyles.icon]}
          />
          <Text style={[styles.smallerText, hmsRoomStyles.regularHighText]}>
            {entry.correctResponses}/{totalQuestions}
          </Text>
        </View>

        {entry.duration ? (
          <View style={styles.iconWrapper}>
            <ClockIcon
              type="normal"
              style={[styles.icon, hmsRoomStyles.icon]}
            />
            <Text style={[styles.smallerText, hmsRoomStyles.regularHighText]}>
              {(entry.duration / 1000).toFixed(2)}s
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  namePositionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  scoreDurationWrapper: { flexDirection: 'row', alignItems: 'center' },
  flexShrink: {
    flexShrink: 1,
  },
  smallerText: {
    fontSize: 12,
    lineHeight: 16,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  position: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  firstPosition: {
    backgroundColor: '#D69516', // '#FFD700'
  },
  secondPosition: {
    backgroundColor: '#3E3E3E', // '#C0C0C0'
  },
  thirdPosition: {
    backgroundColor: '#583B0F', // '#CD7F32'
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
});
