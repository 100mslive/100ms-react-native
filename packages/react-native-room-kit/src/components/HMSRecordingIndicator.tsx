import * as React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator, StyleSheet } from 'react-native';

import type { RootState } from '../redux';
import { RecordingIcon } from '../Icons';
import { useHMSRoomColorPalette, useHMSRoomStyle } from '../hooks-util';

export const HMSRecordingIndicator = () => {
  const isRecordingOn = useSelector(
    (state: RootState) => !!state.hmsStates.room?.browserRecordingState?.running
  );
  const startingOrStoppingRecording = useSelector((state: RootState) => state.app.startingOrStoppingRecording);

  const { on_surface_high: onSurfaceHighColor } = useHMSRoomColorPalette();

  const iconStyles = useHMSRoomStyle((theme) => ({
    tintColor: theme.palette.alert_error_default
  }));

  if (startingOrStoppingRecording) {
    return <ActivityIndicator size={"small"} color={onSurfaceHighColor} />
  }

  if (isRecordingOn) {
    return <RecordingIcon style={[styles.icon, iconStyles]} />;
  }

  return null;
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});
