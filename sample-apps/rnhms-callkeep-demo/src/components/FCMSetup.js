import {useEffect} from 'react';
import {Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
// import messaging from '@react-native-firebase/messaging';
// import {requestNotifications} from 'react-native-permissions';

export const FCMSetup = ({children}) => {
  // This effect handles Firebase Cloud Messaging & RNCallKeep permissions
  useEffect(() => {
    async function requestUserPermission() {
      // // Handle permission on IOS
      // if (Platform.OS === 'ios') {
      //   const authStatus = await messaging().requestPermission();
      //   const enabled =
      //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      //   console.log(
      //     `Authorization status = ${authStatus} ; Is Enabled? = ${enabled}`,
      //   );
      // }
      // // Handle permission on Android
      // else if (Platform.OS === 'android') {
      //   const result = await requestNotifications([]);
      //   console.log('Authorization status:', result);
      // }

      // Handle Callkeep setup and permissions
      RNCallKeep.setup({
        android: {
          alertTitle: 'Permissions required',
          alertDescription:
            'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          imageName: 'phone_account_icon',
          // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
          additionalPermissions: [],
          // Required to get audio in background when using Android 11
          foregroundService: {
            channelId: 'com.company.my',
            channelName: 'Foreground service for my app',
            notificationTitle: 'My app is running on background',
            // notificationIcon: 'Path to the resource icon of the notification',
          },
        },
      });
    }

    requestUserPermission();
  }, []);

  // Registers FCM forground listener
  // useEffect(() => {
  //   // Get FCM Token
  //   messaging()
  //     .getToken()
  //     .then(token => console.log('FCM Token -> ', token));

  //   // Register subscription to handle FCM Message in Foreground state
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     console.log(
  //       'FCM Message handled in Foreground -> ',
  //       JSON.stringify(remoteMessage, null, 2),
  //     );
  //   });

  //   return unsubscribe;
  // }, []);

  return children;
};
