import * as React from 'react';
import type { HMSException } from '@100mslive/react-native-hms';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { HMSNotification } from './HMSNotification';
import { AlertTriangleIcon } from '../Icons';
import { useHMSRoomStyleSheet, useLeaveMethods } from '../hooks-util';
import { OnLeaveReason } from '../utils/types';
import { COLORS } from '../utils/theme';

export interface HMSTerminalErrorNotificationProps {
  id: string;
  exception: HMSException;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const HMSTerminalErrorNotification: React.FC<
  HMSTerminalErrorNotificationProps
> = ({ id, exception, autoDismiss, dismissDelay }) => {
  const { leave } = useLeaveMethods();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.alert_error_default,
    },
    buttonText: {
      color: COLORS.WHITE,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const handleLeaveRoomPress = () => {
    leave(OnLeaveReason.NETWORK_ISSUES);
  };

  const tapGesture = Gesture.Tap();

  return (
    <HMSNotification
      id={id}
      icon={<AlertTriangleIcon />}
      text={exception.description || 'Something went wrong!'}
      dismissDelay={dismissDelay}
      autoDismiss={autoDismiss}
      cta={
        <GestureDetector gesture={tapGesture}>
          <TouchableOpacity
            style={[styles.button, hmsRoomStyles.button]}
            onPress={handleLeaveRoomPress}
          >
            <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
              Leave
            </Text>
          </TouchableOpacity>
        </GestureDetector>
      }
    />
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
