import * as React from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { CreatePoll } from './CreatePoll';
import { PreviousPollsAndQuizzesList } from './PreviousPollsAndQuizzesList';
import type { RootState } from '../redux';
import { BottomSheet } from './BottomSheet';
import { CloseIcon } from '../Icons';
import { useHMSRoomStyleSheet } from '../hooks-util';

export interface PollsConfigAndListProps {
  dismissModal(): void;
}

export const PollsConfigAndList: React.FC<PollsConfigAndListProps> = ({
  dismissModal,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const canCreateOrEndPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollWrite;
  });
  const canVoteOnPoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollRead;
  });

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  };

  return (
    <View style={hmsRoomStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
          Polls and Quizzes
        </Text>

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
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {canCreateOrEndPoll ? <CreatePoll /> : null}
        {canVoteOnPoll || canCreateOrEndPoll ? (
          <PreviousPollsAndQuizzesList />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    // marginVertical: 0,
    // marginTop: 24,
    width: undefined,
  },
  divider: {
    marginHorizontal: 24,
    marginVertical: 24,
    width: undefined,
  },
});
