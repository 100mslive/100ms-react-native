import * as React from 'react';
import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSRecordingState } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { useIsAnyRecordingOn, useIsAnyRecordingPaused } from '../hooks-sdk';

interface HLSRecordingStatusTextProps extends TextProps {
  prefix?: React.ReactElement;
  suffix?: React.ReactElement;
}

export const HLSRecordingStatusText: React.FC<HLSRecordingStatusTextProps> = ({
  prefix,
  suffix,
  ...restProps
}) => {
  const isRecordingOn = useIsAnyRecordingOn();
  const isRecordingPaused = useIsAnyRecordingPaused();
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

  if (startingOrStoppingRecording || !(isRecordingPaused && isRecordingOn)) {
    return null;
  }

  return (
    <>
      {prefix}
      <Text {...restProps}>
        {isRecordingPaused
          ? 'Recording Paused'
          : isRecordingOn
            ? 'Recording'
            : ''}
      </Text>
      {suffix}
    </>
  );
};
