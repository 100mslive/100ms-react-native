import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { HMSNotification } from './HMSNotification';
import { useHMSRoomColorPalette, useHMSRoomStyle } from '../hooks-util';
import { NotificationTypes } from '../types';

export interface HMSReconnectingNotificationProps {}

export const HMSReconnectingNotification: React.FC<
  HMSReconnectingNotificationProps
> = () => {
  const { on_surface_high: onSurfaceHigh } = useHMSRoomColorPalette();
  const notificationStyle = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.surface_default,
  }));

  return (
    <HMSNotification
      id={NotificationTypes.RECONNECTING}
      autoDismiss={false}
      style={notificationStyle}
      text={'You lost your network connection. Trying to reconnect.'}
      icon={<ActivityIndicator size='small' color={onSurfaceHigh} />}
    />
  );
};
