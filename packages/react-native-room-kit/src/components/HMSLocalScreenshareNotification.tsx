import * as React from 'react';

import { useHMSActions } from '../hooks-sdk';
import { ScreenShareIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';
import { HMSNotification } from './HMSNotification';
import { useHMSRoomStyle } from '../hooks-util';
import { NotificationTypes } from '../types';

export interface HMSLocalScreenshareNotificationProps {}

export const HMSLocalScreenshareNotification: React.FC<
  HMSLocalScreenshareNotificationProps
> = () => {
  const hmsActions = useHMSActions();

  const notificationStyle = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.surface_default,
  }));

  const stopScreenshare = async () => {
    await hmsActions.setScreenShareEnabled(false);
  };

  return (
    <HMSNotification
      id={NotificationTypes.LOCAL_SCREENSHARE}
      autoDismiss={false}
      style={notificationStyle}
      text={'You are sharing your screen'}
      icon={<ScreenShareIcon />}
      cta={
        <HMSDangerButton
          loading={false}
          onPress={stopScreenshare}
          title="Stop"
        />
      }
    />
  );
};
