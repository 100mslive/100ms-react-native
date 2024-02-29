import * as React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { HMSPollLeaderboardEntry } from '@100mslive/react-native-hms';
import { FlashList } from '@shopify/flash-list';

import {
  useHMSInstance,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import type { RootState } from '../redux';
import { popFromNavigationStack } from '../redux/actions';
import { BottomSheet } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { PollAndQuizzStateLabel } from './PollAndQuizzStateLabel';
import { LeaderboardEntry } from './LeaderboardEntry';

export interface QuizLeaderboardEntriesScreenProps {
  currentIdx: number;
  dismissModal(): void;
  unmountScreenWithAnimation?(cb: Function): void;
}

export const QuizLeaderboardEntriesScreen: React.FC<
  QuizLeaderboardEntriesScreenProps
> = ({ currentIdx, dismissModal, unmountScreenWithAnimation }) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });

  const initialLeaderboardEntries = useSelector((state: RootState) => {
    return selectedPoll?.pollId
      ? state.polls.leaderboards[selectedPoll.pollId]?.entries
      : null;
  });

  const [leaderboardEntries, setLeaderboardEntries] = React.useState<
    HMSPollLeaderboardEntry[]
  >(initialLeaderboardEntries ? [...initialLeaderboardEntries] : []);

  const startIndexRef = React.useRef(leaderboardEntries.length);

  const { primary_default: primaryDefaultColor } = useHMSRoomColorPalette();
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

  const [loading, setLoading] = React.useState(false);
  const loadingRef = React.useRef(false);
  const mounted = React.useRef(true);
  const canFetchMore = React.useRef(true);

  const fetchLeaderboard = React.useCallback(async () => {
    if (selectedPoll?.pollId && canFetchMore.current && !loadingRef.current) {
      setLoading(true);
      loadingRef.current = true;
      const response = await hmsInstance.interactivityCenter.fetchLeaderboard(
        selectedPoll.pollId,
        50,
        startIndexRef.current + 1, // Indexing starts from 1
        false
      );
      if (mounted) {
        setLoading(false);
        loadingRef.current = false;
        if (Array.isArray(response.entries)) {
          const entries = response.entries;
          setLeaderboardEntries((prev) => {
            const list = [...prev, ...entries];
            startIndexRef.current = list.length;
            return list;
          });
          if (entries.length <= 0) {
            canFetchMore.current = false;
          }
        }
        if (response.hasNext === false) {
          canFetchMore.current = false;
        }
      }
    }
  }, [selectedPoll?.pollId]);

  const totalPoints =
    selectedPoll?.questions?.reduce((acc, curr) => {
      acc += curr.weight;
      return acc;
    }, 0) ?? 0;

  const totalQuestions = selectedPoll?.questions?.length ?? 0;

  const _keyExtractor = React.useCallback(
    (item: HMSPollLeaderboardEntry, index: number) =>
      item.peer?.peerId ?? index.toString(),
    []
  );

  const _renderItem = React.useCallback(
    (data: { item: HMSPollLeaderboardEntry }) => {
      return (
        <LeaderboardEntry
          totalPoints={totalPoints}
          totalQuestions={totalQuestions}
          entry={data.item}
          style={{ marginBottom: 16 }}
        />
      );
    },
    [totalPoints, totalQuestions]
  );

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
            {selectedPoll?.title}
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
      <FlashList
        data={leaderboardEntries}
        ListHeaderComponent={() => (
          <View style={{ paddingTop: 24, paddingBottom: 28 }}>
            <Text style={[styles.normalText, hmsRoomStyles.semiBoldHighText]}>
              Leaderboard
            </Text>
            <Text style={[styles.smallerText, hmsRoomStyles.regularMediumText]}>
              Based on time taken to cast the correct answer
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          loading ? (
            <ActivityIndicator size="small" color={primaryDefaultColor} />
          ) : null
        }
        estimatedItemSize={56}
        onEndReached={() => {
          fetchLeaderboard();
        }}
        // showsVerticalScrollIndicator={Platform.OS !== 'android'}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        // keyboardShouldPersistTaps="always"
        // ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // TODO: There is a bug related to this: https://github.com/Shopify/flash-list/issues/638
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
      />
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
  marginBottom16: {
    marginBottom: 16,
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
