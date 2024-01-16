import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { AlertTriangleIcon, CloseIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';
import { deletePollQuestion } from '../redux/actions';

export interface PollQuestionDeleteConfirmationProps {
  dismissModal(): void;
}

export const PollQuestionDeleteConfirmation: React.FC<
  PollQuestionDeleteConfirmationProps
> = ({ dismissModal }) => {
  const dispatch = useDispatch();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.alert_error_default,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    subtitle: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const disabledButton = false;

  const handleClosePress = () => dismissModal();

  const handlePollQuestionDelete = () => {
    dispatch(deletePollQuestion());
    dismissModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <AlertTriangleIcon style={styles.backIcon} />

          <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
            Delete Question
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, hmsRoomStyles.subtitle]}>
        Are you sure you want to delete this question?{'\n'}You can't undo this
        action.
      </Text>

      <HMSDangerButton
        loading={false}
        onPress={handlePollQuestionDelete}
        title="Delete"
        disabled={disabledButton}
        style={styles.deleteButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 8,
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
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 16,
  },
});
