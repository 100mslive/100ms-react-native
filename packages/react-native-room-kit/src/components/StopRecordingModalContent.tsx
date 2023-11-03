import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import type { RootState } from '../redux';
import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import { AlertTriangleIcon, CloseIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';
import { setStartingOrStoppingRecording } from '../redux/actions';

export interface StopRecordingModalContentProps {
  dismissModal(): void;
}

export const StopRecordingModalContent: React.FC<
  StopRecordingModalContentProps
> = ({ dismissModal }) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const startingOrStoppingRecording = useSelector(
    (state: RootState) =>
      state.app.startingOrStoppingRecording ||
      (state.hmsStates.room?.browserRecordingState.initialising ?? false)
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.alert_error_default,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    text: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const stopRecording = async () => {
    dispatch(setStartingOrStoppingRecording(true));
    try {
      await hmsInstance.stopRtmpAndRecording();
      dismissModal();
    } catch (error) {
      dispatch(setStartingOrStoppingRecording(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <AlertTriangleIcon />

          <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
            Stop Recording
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismissModal}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <Text style={[styles.text, hmsRoomStyles.text]}>
        Are you sure you want to stop recording? You can't undo this action.
      </Text>

      <HMSDangerButton
        loading={startingOrStoppingRecording}
        onPress={stopRecording}
        title="Stop Recording"
        disabled={startingOrStoppingRecording}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginLeft: 8,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginBottom: 16,
  },
});
