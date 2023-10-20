import * as React from 'react';

import { HMSNotification } from './HMSNotification';
import { AlertTriangleIcon, RecordingIcon } from '../Icons';
import { useDispatch } from 'react-redux';
import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { removeNotification } from '../redux/actions';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import type { HMSException } from '@100mslive/react-native-hms';

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

  // const { secondary_dim: secondaryDimColor } = useHMSRoomColorPalette();

  // const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
  //   button: {
  //     backgroundColor: theme.palette.secondary_default,
  //   },
  //   buttonText: {
  //     color: theme.palette.on_secondary_high,
  //     fontFamily: `${typography.font_family}-SemiBold`,
  //   },
  // }));

  const dismissNotification = () => dispatch(removeNotification(id));

  // const retryStartRecording = async () => {
  //   dismissNotification();
  // };

  return (
    <HMSNotification
      id={id}
      icon={<AlertTriangleIcon />}
      text={exception.description || 'Something went wrong!'}
      dismissDelay={dismissDelay}
      autoDismiss={autoDismiss}
      // cta={exception.isTerminal ?
      //   <TouchableHighlight
      //     underlayColor={secondaryDimColor}
      //     style={[styles.button, hmsRoomStyles.button]}
      //     onPress={retryStartRecording}
      //   >
      //     <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
      //       Retry
      //     </Text>
      //   </TouchableHighlight>
      // : undefined}
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
