import * as React from 'react';

import { useHMSActions } from '../hooks-sdk';
import { ScreenShareIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';
import { HMSNotification } from './HMSNotification';
import { useHMSRoomStyle } from '../hooks-util';
import { NotificationTypes } from '../types';
import { TestIds } from '../utils/constants';

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
      textTestID={TestIds.notification_sharing_screen}
      icon={<ScreenShareIcon />}
      cta={
        <HMSDangerButton
          testID={TestIds.notification_stop_screen_share_btn}
          loading={false}
          onPress={stopScreenshare}
          title="Stop"
          wrapWithGestureDetector={true}
        />
      }
    />
  );
};
