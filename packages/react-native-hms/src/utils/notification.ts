import HMSManager from '../modules/HMSManagerModule';

export type NotificationResult = {
  status: 'granted' | 'blocked';
  settings: {};
};

export const checkNotifications = async (): Promise<NotificationResult> => {
  return HMSManager.checkNotifications();
};
