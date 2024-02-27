import * as React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { PollLeaderboardResponse } from '@100mslive/react-native-hms';

import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { popFromNavigationStack } from '../redux/actions';
import { BottomSheet } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { PollAndQuizzStateLabel } from './PollAndQuizzStateLabel';

export interface QuizLeaderboardScreenProps {
  currentIdx: number;
  dismissModal(): void;
  unmountScreenWithAnimation?(cb: Function): void;
}

export const QuizLeaderboardScreen: React.FC<QuizLeaderboardScreenProps> = ({
  currentIdx,
  dismissModal,
  unmountScreenWithAnimation,
}) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const [leaderboardData, setLeaderboardData] =
    React.useState<PollLeaderboardResponse | null>(null);

  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });
  const headerTitle = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId]?.title || null;
    }
    return null;
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    semiBoldHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    summaryContainer: {
      backgroundColor: theme.palette.surface_default,
    },
  }));

  const handleBackPress = () => {
    Keyboard.dismiss();
    if (typeof unmountScreenWithAnimation === 'function') {
      unmountScreenWithAnimation(() => dispatch(popFromNavigationStack()));
    } else {
      dispatch(popFromNavigationStack());
    }
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  };

  React.useEffect(() => {
    let mounted = true;

    async function fetchLeaderboard() {
      if (selectedPoll?.pollId) {
        const response = await hmsInstance.interactivityCenter.fetchLeaderboard(
          selectedPoll.pollId,
          5,
          0,
          true
        );
        if (mounted) {
          setLeaderboardData(response);
        }
      }
    }
    fetchLeaderboard();

    return () => {
      mounted = false;
    };
  }, [selectedPoll?.pollId]);

  const leaderboardSummary = leaderboardData?.summary;

  return (
    <View style={[styles.fullView, hmsRoomStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          {currentIdx > 0 ? (
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={styles.closeIconHitSlop}
              style={styles.backIcon}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          ) : null}

          <Text
            numberOfLines={2}
            style={[
              styles.headerText,
              { flexShrink: 1 },
              hmsRoomStyles.headerText,
            ]}
          >
            {headerTitle}
          </Text>

          {selectedPoll?.state ? (
            <PollAndQuizzStateLabel state={selectedPoll?.state} />
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
          style={{ marginLeft: 16 }}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider style={styles.halfDivider} />

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <Text
          style={[
            styles.normalText,
            styles.marginBottom16,
            hmsRoomStyles.semiBoldHighText,
          ]}
        >
          Participation Summary
        </Text>

        <View style={styles.marginBottom16}>
          {[
            [
              {
                label: 'ANSWERED',
                value: `${((leaderboardSummary?.respondedPeersCount || 0) / (leaderboardSummary?.totalPeersCount || 0)) * 100}% (${leaderboardSummary?.respondedPeersCount}/${leaderboardSummary?.totalPeersCount})`,
              },
              {
                label: 'CORRECT ANSWERS',
                value: `${((leaderboardSummary?.respondedCorrectlyPeersCount || 0) / (leaderboardSummary?.totalPeersCount || 0)) * 100}% (${leaderboardSummary?.respondedCorrectlyPeersCount}/${leaderboardSummary?.totalPeersCount})`,
              },
            ],
            [
              {
                label: 'AVG. TIME TAKEN',
                value: leaderboardSummary?.averageTime ?? '-',
              },
              {
                label: 'AVG. SCORE',
                value: leaderboardSummary?.averageScore ?? '-',
              },
            ],
          ].map((summaryMap, index) => (
            <View key={index} style={{ marginBottom: 8, flexDirection: 'row' }}>
              {summaryMap.map((summary, index) => (
                <React.Fragment key={summary.label}>
                  {index > 0 ? <View style={{ width: 8 }} /> : null}

                  <View
                    style={[
                      styles.summaryWrapper,
                      hmsRoomStyles.summaryContainer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tinyText,
                        styles.marginBottom8,
                        hmsRoomStyles.semiBoldMediumText,
                      ]}
                    >
                      {summary.label}
                    </Text>

                    <Text
                      style={[
                        styles.normalText,
                        hmsRoomStyles.semiBoldHighText,
                      ]}
                    >
                      {summary.value}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>

        <Text style={[styles.normalText, hmsRoomStyles.semiBoldHighText]}>
          Leaderboard
        </Text>
        <Text
          style={[
            styles.smallerText,
            hmsRoomStyles.regularMediumText,
            styles.marginBottom16,
          ]}
        >
          Based on time taken to cast the correct answer
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tinyText: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
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
  marginBottom8: {
    marginBottom: 8,
  },
  marginBottom16: {
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  summaryWrapper: {
    flexBasis: '50%',
    flexGrow: 1,
    flexShrink: 1,
    padding: 16,
    borderRadius: 12,
  },
  // Utilities
  fullView: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 24,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginRight: 12,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  // Divider
  halfDivider: {
    marginHorizontal: 24,
    marginVertical: 0,
    marginTop: 24,
    width: undefined,
  },
});
