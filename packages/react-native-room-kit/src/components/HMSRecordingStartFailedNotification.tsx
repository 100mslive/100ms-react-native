import * as React from 'react';

import { HMSNotification } from './HMSNotification';
import { RecordingIcon } from '../Icons';
import { useDispatch } from 'react-redux';
import { useHMSRoomColorPalette, useHMSRoomStyleSheet, useStartRecording } from '../hooks-util';
import { removeNotification } from '../redux/actions';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

export interface HMSRecordingStartFailedNotificationProps {
  id: string;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const HMSRecordingStartFailedNotification: React.FC<
  HMSRecordingStartFailedNotificationProps
> = ({ id, autoDismiss, dismissDelay }) => {
  const dispatch = useDispatch();

  const { secondary_dim: secondaryDimColor } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.secondary_default,
    },
    buttonText: {
      color: theme.palette.on_secondary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const dismissNotification = () => dispatch(removeNotification(id));

  const { startRecording } = useStartRecording();

  const retryStartRecording = async () => {
    dismissNotification();
    startRecording();
  };

  return (
    <HMSNotification
      id={id}
      icon={<RecordingIcon type='off' />}
      text={`Recording failed to start`}
      dismissDelay={dismissDelay}
      autoDismiss={autoDismiss}
      cta={
        <TouchableHighlight
          underlayColor={secondaryDimColor}
          style={[styles.button, hmsRoomStyles.button]}
          onPress={retryStartRecording}
        >
          <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
            Retry
          </Text>
        </TouchableHighlight>
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
