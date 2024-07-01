import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import type { RootState } from '../redux';
import { HMSLocalScreenshareNotification } from './HMSLocalScreenshareNotification';
import { HMSHandRaiseNotification } from './HMSHandRaiseNotification';
import { HMSRoleChangeDeclinedNotification } from './HMSRoleChangeDeclinedNotification';
import { NotificationTypes } from '../types';
import { HMSTerminalErrorNotification } from './HMSTerminalErrorNotification';
import { HMSNotification } from './HMSNotification';
import { AlertTriangleIcon } from '../Icons';
import { HMSReconnectingNotification } from './HMSReconnectingNotification';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { HMSPollsQuizzesNotification } from './HMSPollsQuizzesNotification';
import { useIsHLSViewer } from '../hooks-util';

export interface HMSNotificationsProps {}

const LOCAL_SCREENSHARE_PAYLOAD = {
  id: NotificationTypes.LOCAL_SCREENSHARE,
  type: NotificationTypes.LOCAL_SCREENSHARE,
};

export const HMSNotifications: React.FC<HMSNotificationsProps> = () => {
  const isLocalScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared
  );
  const isHLSViewer = useIsHLSViewer();
  const isLandscapeOrientation = useIsLandscapeOrientation();

  // notifications is a stack, first will appear last
  const notifications = useSelector((state: RootState) => {
    // Latest notification will be at 0th index.
    const allNotifications = state.app.notifications;

    let list: typeof allNotifications = [];

    if (isLocalScreenShared) {
      list.push(LOCAL_SCREENSHARE_PAYLOAD);

      // We are picking the latest notification always
      if (allNotifications.length > 0) {
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
    } else if (allNotifications.length > 0) {
      const firstNotification = allNotifications[0];

      const secondNotification =
        allNotifications.length > 1 ? allNotifications[1] : null;

      const thirdNotification =
        allNotifications.length > 2 ? allNotifications[2] : null;

      if (thirdNotification) {
        list.push(thirdNotification);
      }

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
    <View
      style={[
        isLandscapeOrientation && !isHLSViewer
          ? styles.absoluteLandscapeContainer
          : styles.absoluteContainer,
        { paddingTop: (notifications.length - 1) * 16 },
      ]}
    >
      {notifications.map((notification, index, arr) => {
        const atTop = index === arr.length - 1;
        const atBottom = index === 0;
        return (
          <View
            key={notification.id}
            style={[
              {
                transform: [{ scale: getScale(arr.length, index) }],
              },
              atBottom ? null : styles.notificationWrapper,
              atBottom ? null : { bottom: index * 16 },
            ]}
          >
            {notification.type === NotificationTypes.LOCAL_SCREENSHARE ? (
              <HMSLocalScreenshareNotification />
            ) : notification.type === NotificationTypes.RECONNECTING ? (
              <HMSReconnectingNotification />
            ) : notification.type === NotificationTypes.HAND_RAISE &&
              'peer' in notification ? (
              <HMSHandRaiseNotification
                id={notification.id}
                peer={notification.peer}
                autoDismiss={atTop}
                dismissDelay={20000}
              />
            ) : notification.type === NotificationTypes.ROLE_CHANGE_DECLINED &&
              'peer' in notification ? (
              <HMSRoleChangeDeclinedNotification
                id={notification.id}
                peerName={notification.peer.name || ''}
                autoDismiss={atTop}
                dismissDelay={10000}
              />
            ) : notification.type === NotificationTypes.TERMINAL_ERROR &&
              'exception' in notification ? (
              <HMSTerminalErrorNotification
                id={notification.id}
                exception={notification.exception}
                autoDismiss={false}
              />
            ) : notification.type === NotificationTypes.ERROR &&
              ('message' in notification || 'title' in notification) ? (
              <HMSNotification
                icon={<AlertTriangleIcon type="line" />}
                id={notification.id}
                text={notification.title}
                autoDismiss={false}
                dismissable={true}
              />
            ) : notification.type === NotificationTypes.INFO &&
              ('message' in notification || 'title' in notification) ? (
              <HMSNotification
                id={notification.id}
                icon={notification.icon}
                description={notification.message}
                text={notification.title}
                autoDismiss={true}
                dismissable={true}
              />
            ) : notification.type === NotificationTypes.POLLS_AND_QUIZZES &&
              'payload' in notification ? (
              <HMSPollsQuizzesNotification
                id={notification.id}
                payload={notification.payload}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export const useHMSNotificationsHeight = () => {
  const numberOfNotifications = useSelector((state: RootState) => {
    const allNotifications = state.app.notifications;
    const isLocalScreenShared = state.hmsStates.isLocalScreenShared;

    return (
      Math.min(allNotifications.length, isLocalScreenShared ? 2 : 3) +
      (isLocalScreenShared ? 1 : 0)
    );
  });

  if (numberOfNotifications === 0) return 0;

  return 8 + (numberOfNotifications - 1) * 16 + 56; // marginBottom + calculated paddingTop + content
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'relative',
    marginBottom: 8,
    width: '100%',
  },
  absoluteLandscapeContainer: {
    position: 'relative',
    marginBottom: 8,
    width: '60%',
    alignSelf: 'center',
  },
  notificationWrapper: {
    position: 'absolute',
    width: '100%',
  },
});

const getScale = (totalItem: number, current: number): number => {
  if (totalItem === 1) {
    return 1;
  }

  if (totalItem === 2) {
    return [0.96, 1][current]!;
  }

  if (totalItem === 3) {
    return [0.94, 0.97, 1][current]!;
  }

  return 1;
};
