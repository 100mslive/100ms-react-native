import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HMSPollState } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../hooks-util';

export interface PollAndQuizzStateLabelProps {
  state: HMSPollState;
}

export const PollAndQuizzStateLabel: React.FC<PollAndQuizzStateLabelProps> = ({
  state,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighSemiBoldText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    liveStateLabelWrapper: {
      backgroundColor: theme.palette.alert_error_default,
    },
    stateLabelWrapper: {
      backgroundColor: theme.palette.surface_brighter,
    },
  }));

  return (
    <View
      style={[
        styles.stateLabelWrapper,
        state === HMSPollState.started
          ? hmsRoomStyles.liveStateLabelWrapper
          : hmsRoomStyles.stateLabelWrapper,
      ]}
    >
      <Text style={[styles.stateLabel, hmsRoomStyles.surfaceHighSemiBoldText]}>
        {state === HMSPollState.started
          ? 'LIVE'
          : state === HMSPollState.stopped
            ? 'ENDED'
            : 'DRAFT'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  spacer: {
    height: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pollTitle: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  stateLabelWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  stateLabel: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },
});
