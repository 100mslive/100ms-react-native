import messaging from '@react-native-firebase/messaging';
import {
  displayIncomingCall,
  handleCallKeepInitialSetup,
  setupAnswerIncomingCallListener,
} from './callkeep.service';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log(
    'FCM Message handled in the background!',
    JSON.stringify(remoteMessage, null, 2),
  );

  if (remoteMessage.data.room_code) {
    handleCallKeepInitialSetup();

    displayIncomingCall(remoteMessage.data.room_code);

    // Setup listener for when user clicks answer button on Incoming call screen
    setupAnswerIncomingCallListener();
  }
});
