import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCallKeep from 'react-native-callkeep';

// Sets up any data or state before displaying Incoming screen UI
// Calling `RNCallKeep.setup` method is important before `RNCallKeep.displayIncomingCall`
export const handleCallKeepInitialSetup = () => {
  RNCallKeep.setup({
    ios: {
      appName: 'HMS CallKeep Demo',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
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

  RNCallKeep.setAvailable(true);
};

// Display Incoming screen UI
export const displayIncomingCall = roomCode => {
  RNCallKeep.displayIncomingCall(
    roomCode,
    '100msPhoneNumber',
    '100ms Call',
    'number',
    false,
  );
};

export const setupAnswerIncomingCallListener = () => {
  // Add listener for handling Answer button press
  RNCallKeep.addEventListener('answerCall', data => {
    // Remove this listener
    RNCallKeep.removeEventListener('answerCall');

    // Open Closed App or bring to foreground
    RNCallKeep.backToForeground();

    // Dismiss Incoming Call screen UI
    RNCallKeep.endCall(data.callUUID);

    // Save payload in localstorage so that we can access it from inside app later
    AsyncStorage.setItem('answerCall_data', JSON.stringify(data));
  });
};
