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

import { useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import {
  popFromNavigationStack,
  pushToNavigationStack,
} from '../redux/actions';
import { BottomSheet } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { PollAndQuizzStateLabel } from './PollAndQuizzStateLabel';
import { LeaderboardEntry } from './LeaderboardEntry';
import { CreatePollStages } from '../redux/actionTypes';
import { QuizLeaderboardSummary } from './QuizLeaderboardSummary';
import {
  useFetchLeaderboardResponse,
  useLeaderboardSummaryData,
} from '../utils/hooks';

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
  const dispatch = useDispatch();

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
    regularHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
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
    entriesCard: {
      backgroundColor: theme.palette.surface_default,
    },
    divider: {
      backgroundColor: theme.palette.border_bright,
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

  const viewAllLeaderboardEntries = () => {
    dispatch(pushToNavigationStack(CreatePollStages.QUIZ_LEADERBOARD_ENTRIES));
  };

  const leaderboardData = useFetchLeaderboardResponse(selectedPoll?.pollId);

  const leaderboardEntries = leaderboardData?.entries;

  const summaryData = useLeaderboardSummaryData(selectedPoll?.pollId);

  const totalPoints =
    selectedPoll?.questions?.reduce((acc, curr) => {
      acc += curr.weight;
      return acc;
    }, 0) ?? 0;

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
        {summaryData ? <QuizLeaderboardSummary data={summaryData} /> : null}

        {selectedPoll &&
        Array.isArray(selectedPoll.questions) &&
        Array.isArray(leaderboardEntries) &&
        leaderboardEntries.length > 0 ? (
          <React.Fragment>
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

            <View style={[styles.entriesCard, hmsRoomStyles.entriesCard]}>
              {leaderboardEntries.map((entry, index) => {
                return (
                  <LeaderboardEntry
                    key={index}
                    entry={entry}
                    totalPoints={totalPoints}
                    totalQuestions={selectedPoll.questions?.length ?? 0}
                    style={styles.leaderboardEntry}
                  />
                );
              })}

              {leaderboardData?.hasNext && leaderboardEntries.length >= 5 ? (
                <React.Fragment>
                  <View style={[styles.divider, hmsRoomStyles.divider]} />

                  <TouchableOpacity
                    onPress={viewAllLeaderboardEntries}
                    style={styles.viewAllBtn}
                  >
                    <Text
                      style={[
                        styles.smallText,
                        hmsRoomStyles.regularHighText,
                        { marginRight: 4 },
                      ]}
                    >
                      View All
                    </Text>

                    <ChevronIcon direction="right" />
                  </TouchableOpacity>
                </React.Fragment>
              ) : null}
            </View>
          </React.Fragment>
        ) : null}
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
  position: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
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
  divider: { height: 1, width: '100%' },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leaderboardEntry: { marginBottom: 16, marginHorizontal: 16 },
  entriesCard: { paddingTop: 12, borderRadius: 8 },
});
