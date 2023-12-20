import * as React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle, TextProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { CloseIcon } from '../Icons';
import { UnmountAfterDelay } from './UnmountAfterDelay';
import { removeNotification } from '../redux/actions';

export interface HMSNotificationProps {
  id: string;
  text: string | React.ReactElement;
  textTestID?: TextProps['testID'];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactElement;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
  cta?: React.ReactElement;
  dismissable?: boolean;
}

export const HMSNotification: React.FC<HMSNotificationProps> = ({
  id,
  text,
  icon,
  style,
  textStyle,
  cta,
  textTestID,
  onDismiss,
  dismissDelay = 5000,
  autoDismiss = true,
  dismissable = false,
}) => {
  const dispatch = useDispatch();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const dismissNotification =
    onDismiss ||
    (autoDismiss || dismissable
      ? () => {
          dispatch(removeNotification(id));
        }
      : null);

  const tapGesture = Gesture.Tap();

  const notification = (
    <View style={[styles.container, hmsRoomStyles.container, style]}>
      <View style={styles.leftWrapper}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}

        {typeof text === 'string' ? (
          <Text testID={textTestID} style={[styles.text, hmsRoomStyles.text, textStyle]}>
            {text}
          </Text>
        ) : (
          text
        )}
      </View>

      <View style={styles.rightWrapper}>
        {cta}

        {dismissNotification ? (
          <GestureDetector gesture={tapGesture}>
            <TouchableOpacity onPress={dismissNotification}>
              <CloseIcon />
            </TouchableOpacity>
          </GestureDetector>
        ) : null}
      </View>
    </View>
  );

  if (dismissNotification && autoDismiss) {
    return (
      <UnmountAfterDelay
        visible={true}
        onUnmount={dismissNotification}
        delay={dismissDelay}
      >
        {notification}
      </UnmountAfterDelay>
    );
  }

  return notification;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    elevation: 2,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 8,
    paddingLeft: 16,
    marginHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});
