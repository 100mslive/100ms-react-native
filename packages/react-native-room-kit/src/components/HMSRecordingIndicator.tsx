import * as React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator, StyleSheet } from 'react-native';

import type { RootState } from '../redux';
import { RecordingIcon } from '../Icons';
import { useHMSRoomColorPalette, useHMSRoomStyle } from '../hooks-util';
import { HMSRecordingState } from '@100mslive/react-native-hms';

export const HMSRecordingIndicator = () => {
  const isRecordingOn = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.browserRecordingState?.state === HMSRecordingState.STARTED ||
      state.hmsStates.room?.browserRecordingState?.state === HMSRecordingState.RESUMED ||

      state.hmsStates.room?.serverRecordingState?.state === HMSRecordingState.STARTED ||
      state.hmsStates.room?.serverRecordingState?.state === HMSRecordingState.RESUMED ||

      state.hmsStates.room?.hlsRecordingState?.state === HMSRecordingState.STARTED ||
      state.hmsStates.room?.hlsRecordingState?.state === HMSRecordingState.RESUMED
  );
  const isRecordingPaused = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.browserRecordingState?.state === HMSRecordingState.PAUSED ||
      state.hmsStates.room?.serverRecordingState?.state === HMSRecordingState.PAUSED ||
      state.hmsStates.room?.hlsRecordingState?.state === HMSRecordingState.PAUSED
  );
  const startingOrStoppingRecording = useSelector(
    (state: RootState) =>
      state.app.startingOrStoppingRecording ||
      state.hmsStates.room?.browserRecordingState.state ===
        HMSRecordingState.STARTING ||
      state.hmsStates.room?.serverRecordingState.state ===
        HMSRecordingState.STARTING ||
      state.hmsStates.room?.hlsRecordingState?.state ===
        HMSRecordingState.STARTING
  );

  const { on_surface_high: onSurfaceHighColor } = useHMSRoomColorPalette();

  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.alert_error_default,
  }));

  if (startingOrStoppingRecording) {
    return (
      <ActivityIndicator
        size={'small'}
        color={onSurfaceHighColor}
        style={styles.rightSpace}
      />
    );
  }

  if (isRecordingOn) {
    return (
      <RecordingIcon style={[styles.icon, styles.rightSpace, iconStyles]} />
    );
  }

  if (isRecordingPaused) {
    return (
      <RecordingIcon type='pause' style={[styles.icon, styles.rightSpace]} />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  rightSpace: {
    marginRight: 8,
  },
});
