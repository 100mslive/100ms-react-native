import * as React from 'react';
import { useDispatch } from 'react-redux';
import type { HMSException } from '@100mslive/react-native-hms';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { HMSNotification } from './HMSNotification';
import { AlertTriangleIcon } from '../Icons';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { removeNotification } from '../redux/actions';
import { ModalTypes } from '../utils/types';
import { COLORS } from '../utils/theme';

export interface HMSExceptionNotificationProps {
  id: string;
  exception: HMSException;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const HMSExceptionNotification: React.FC<
  HMSExceptionNotificationProps
> = ({ id, exception, autoDismiss, dismissDelay }) => {
  const dispatch = useDispatch();
  const { handleModalVisibleType } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.alert_error_default,
    },
    buttonText: {
      color: COLORS.WHITE,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const dismissNotification = () => dispatch(removeNotification(id));

  const handleLeaveRoomPress = () =>
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);

  return (
    <HMSNotification
      id={id}
      icon={<AlertTriangleIcon />}
      text={exception.description || 'Something went wrong!'}
      dismissDelay={dismissDelay}
      autoDismiss={autoDismiss}
      cta={
        exception.isTerminal ? (
          <TouchableOpacity
            style={[styles.button, hmsRoomStyles.button]}
            onPress={handleLeaveRoomPress}
          >
            <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
              Leave
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
      onDismiss={dismissNotification}
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
