import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import type { HMSPeer } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { HMSLocalScreenshareNotification } from './HMSLocalScreenshareNotification';
import { HMSHandRaiseNotification } from './HMSHandRaiseNotification';
import { HMSRoleChangeDeclinedNotification } from './HMSRoleChangeDeclinedNotification';
import { NotificationTypes } from '../utils';

export interface HMSNotificationsProps {}

const LOCAL_SCREENSHARE_PAYLOAD = {
  id: NotificationTypes.LOCAL_SCREENSHARE,
  type: NotificationTypes.LOCAL_SCREENSHARE,
};

export const HMSNotifications: React.FC<HMSNotificationsProps> = () => {
  const isLocalScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared
  );
  const notifications: (
    | typeof LOCAL_SCREENSHARE_PAYLOAD
    | { id: string; type: string; peer: HMSPeer }
  )[] = useSelector((state: RootState) => {
    const allNotifications = state.app.notifications;

    let list = [];

    if (isLocalScreenShared) {
      list.push(LOCAL_SCREENSHARE_PAYLOAD);

      if (allNotifications.length > 0) {
        const firstNotification = allNotifications[0];

        if (firstNotification) {
          list.unshift(firstNotification);
        }
      }
    } else if (allNotifications.length > 0) {
      const firstNotification = allNotifications[0];

      const secondNotification =
        allNotifications.length > 1 ? allNotifications[1] : null;

      if (secondNotification) {
        list.push(secondNotification);
      }

      if (firstNotification) {
        list.push(firstNotification);
      }
    }

    return list;
  }, shallowEqual);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.absoluteContainer}>
      {notifications.map((notification, index, arr) => (
        <View
          key={index}
          style={[
            {
              transform: [{ scale: index === 0 && arr.length > 1 ? 0.96 : 1 }],
            },
            index === 0 ? null : styles.notificationWrapper,
            index === 0 ? null : { bottom: index * 16 },
          ]}
        >
          {notification.type === NotificationTypes.LOCAL_SCREENSHARE ? (
            <HMSLocalScreenshareNotification />
          ) : notification.type === NotificationTypes.HAND_RAISE &&
            'peer' in notification ? (
            <HMSHandRaiseNotification
              id={notification.id}
              peer={notification.peer}
            />
          ) : notification.type === NotificationTypes.ROLE_CHANGE_DECLINED &&
            'peer' in notification ? (
            <HMSRoleChangeDeclinedNotification
              id={notification.id}
              peerName={notification.peer.name}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    zIndex: 1,
    // backgroundColor: 'yellow',
  },
  notificationWrapper: {
    position: 'absolute',
    width: '100%',
  },
});
