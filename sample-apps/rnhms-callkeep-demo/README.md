# 100ms RN SDK and Callkeep Demo

This repository showcases a basic implementation of [react-native-callkeep](https://github.com/react-native-webrtc/react-native-callkeep) library
with [100ms React Native SDK](https://github.com/100mslive/react-native-hms).

The app has implemented basic video call conferencing using `v1.6.2` of the `100mslive/react-native-hms` library. It uses
[Room Code](https://www.100ms.live/docs/react-native/v2/quickstart/token#get-room-code-from-100ms-dashboard) for generating 100ms Auth Token.

Branch Setup:

- `origin/main` branch has a basic video call conferencing feature with 100ms

- `origin/android-feature-fcm-support` branch has implemented support for Firebase cloud messaging. This allows us to send data notifications
to the app even when it's in an inactive state.

- `origin/android-feature-callkeep-support` branch has implemented support for
[Reacty Native Callkeep](https://github.com/react-native-webrtc/react-native-callkeep) library.


> Important Note: React Native Callkeep library and Firebase support are added only for Android. Therefore, the iOS build can only be made on the `main` branch.


## Showcase Video of the App

https://github.com/stanwolverine/rnhms-callkeep-demo/assets/45194090/23f06e6c-2088-4a5c-ab2e-5291e104d962

## Steps to Implement WhatsApp like call feature with 100ms RN SDK

We will implement a basic feature in which the App can receive an incoming call and can answer it. When the user answers the incoming call, it should
be able to successfully do conferencing calls with the caller.


### 1. Implement 100ms React Native SDK in your app

You can follow [100ms React Native quickstart guide](https://www.100ms.live/docs/react-native/v2/quickstart/quickstart) to quickly implement 100ms
React Native SDK within your app.

The `main` branch of this repository implements the basic video call conferencing feature with 100ms React Native SDK.

You can also checkout [quickstart app](https://github.com/100mslive/react-native-hms/tree/main/sample-apps/rn-quickstart-app) or
[advanced example app](https://github.com/100mslive/react-native-hms/tree/main/example) which implements all the features provided by 100ms.

### 2. Add support for Firebase Cloud Messaging

By adding support for Firebase Cloud Messaging, We can send data notifications to the application to notify it about the incoming call, so that it
can show Incoming Call UI screen.

Follow the [React Native Firebase](https://rnfirebase.io/messaging/usage) guide for this.

### 3. Add React Native Callkeep library support

This library allows us to show the Incoming call UI screen on receive of a data notification from FCM and provides many other features.
Follow the [React Native Callkeep library](https://github.com/react-native-webrtc/react-native-callkeep) official guide to implement it in your app.

Also, check out [React Native Callkeep library changes diff](https://github.com/stanwolverine/rnhms-callkeep-demo/compare/android-feature-fcm-support...android-feature-callkeep-support)

After completing the above steps, Rebuild your application and check it is working correctly. Then follow the below steps to quickly
integrate Callkeep library with 100ms RN SDK.

### 4. RNCallkeep setup

RNCallkeep library requires some permissions before its features can be used without any problem.

We need to call the `RNCallKeep.setup` method on the main screen of the app so that it always gets called whenever the app starts.
In this way, We will already have the required permissions before the app shows the call screen from an inactive state.

We are calling the `RNCallKeep.setup` method in [`FCMSetup` component](https://github.com/stanwolverine/rnhms-callkeep-demo/blob/android-feature-callkeep-support/src/components/FCMSetup.js)
which is always rendered irrespective of the screen user is on.

<img width="600" alt="FCMSetup component snapshot" src="https://github.com/stanwolverine/rnhms-callkeep-demo/assets/45194090/76d62044-7c3f-4eb2-93d5-825c02864b6e">

### 5. Sending Data Notifications to the app

Now let's say, App is in the inactive state, and we already have the required Callkeep permissions because we
called the `RNCallKeep.setup` method when the app ran for the first time.

When the app is in the inactive state, You can send a data-only notification with "high" priority to the app using FCM.

We will also send "Room Code" as a payload so that we can generate Auth Token in the app and add a user in the room -

```
{
  "message": {
    "token": "<Paste FCM Token Here>",
    "android": { "priority": "HIGH" },
    "data": { room_code: "nih-bkn-vek" }
  }
}
```

For the app's inactive state, the App will receive the data notification in the callback function passed to the `messaging().setBackgroundMessageHandler` method -

```
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Message handled in the background!', JSON.stringify(remoteMessage, null, 2));

  if (remoteMessage.data.room_code) {
    // If Room Code is available in payload data
    // We can show the incoming screen UI to the user.
  }
});
```

### 6. Showing Incoming Call UI

In the callback function, which is called on receiving of notification, We need to again call the `RNCallKeep.setup` method before showing the Incoming Call UI.

After calling the `RNCallKeep.setup` method, We can show the Incoming Call UI by calling the `RNCallKeep.displayIncomingCall` method and passing the received "Room Code" as the first argument.

The Incoming call screen should be presented to the user at this point.

Now, when the user presses the "Call Answer" button, We need to dismiss the Incoming Call UI and navigate the user to our app with the "Room Code" payload.

We need this "Room Code" payload to generate Auth Token and add users to the room. When "Room Code" data is detected at the start of the app, we can
directly navigate the user to the "Meeting screen" instead of the Welcome screen.

Then, Inside the Meeting screen, we can set up the HMSSDK instance, generate Auth token and call the `join` function to add the user to the room.

```
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Message handled in the background!', JSON.stringify(remoteMessage, null, 2));

  // If Room Code is available in payload data
  // We can show the incoming screen UI to the user.
  if (remoteMessage.data.room_code) {

    // Step 1: Setup RNCallKeep Native Module
    RNCallKeep.setup({
      android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        imageName: 'phone_account_icon',
        // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
        additionalPermissions: [],
        // Required to get audio in the background when using Android 11
        foregroundService: {
          channelId: 'com.company.my',
          channelName: 'Foreground service for my app',
          notificationTitle: 'My app is running in the background',
          // notificationIcon: 'Path to the resource icon of the notification',
        },
      }
    });

    // Step 2: Set user availability
    RNCallKeep.setAvailable(true);

    // Step 3: Show the Incoming Call UI screen to the user with Room Code as callUUID
    RNCallKeep.displayIncomingCall(
      remoteMessage.data.room_code,
      '100msPhoneNumber',
      '100ms Call',
      'number',
      false,
    );

    // Step 4: Add a listener for when the user clicks on the answer button
    RNCallKeep.addEventListener('answerCall', (data) => {
      // Remove this listener when it is called
      RNCallKeep.removeEventListener('answerCall');

      // Open Closed App or bring to the foreground
      RNCallKeep.backToForeground();

      // Dismiss Incoming Call screen UI
      RNCallKeep.endCall(data.callUUID);

      // Save payload in localstorage or whatever you prefer
      // so that we can access it from inside the app later
      AsyncStorage.setItem('answerCall_data', JSON.stringify(data));
    });
  }
});
```

### 7. Handling App UI

When the App starts, fetch if any data is available for the incoming call, for our case, we saved "room code" data in `AsyncStorage` by the `answerCall_data` key.
If no data is present for the `answerCall_data` key, then the app can continue the normal flow, otherwise, you can show directly show "Meeting screen"
to the user and pass the fetched "room code" to the "Meeting screen".

You can check out how we handled App UI in the app [here](https://github.com/stanwolverine/rnhms-callkeep-demo/blob/android-feature-callkeep-support/src/navigator/index.js#L72)

```
// Sudo Code for Handling App UI logic

// Fetch data from AsyncStorage
const data = await AsyncStorage.getItem('answerCall_data');

// If roomCode data is found, render MeetingScreen
// Clear roomCode data

if (data.roomCode) {
  return <MeetingScreen roomCode={data.roomCode} />
}

// If roomCode data is unavailable, continue the normal flow
return <WelcomeScreen />
```

## Other Useful links

1. [Blog on how to send data notification to users](https://apoorv487.medium.com/testing-fcm-push-notification-http-v1-through-oauth-2-0-playground-postman-terminal-part-2-7d7a6a0e2fa0)
2. [FCM data payload structure](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#androidnotification)
3. [Useful RNCallKeep library fork](https://github.com/react-native-webrtc/react-native-callkeep/issues/226)
4. [Blog on RNCallKeep library usage and handling some edge cases](https://blog.theodo.com/2021/03/react-native-incoming-call-ui-callkeep/)
