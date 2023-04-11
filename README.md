<a href="https://100ms.live/">
<img src="https://raw.githubusercontent.com/100mslive/react-native-hms/main/100ms.svg" title="100ms logo" float=center height=256>
</a>

[![npm](https://img.shields.io/npm/v/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![license](https://img.shields.io/npm/l/@100mslive/react-native-hms)](https://www.100ms.live/)
[![quality](https://img.shields.io/npms-io/quality-score/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![collaborators](https://img.shields.io/npm/collaborators/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![Documentation](https://img.shields.io/badge/Read-Documentation-blue)](https://docs.100ms.live/react-native/v2/foundation/basics)
[![Discord](https://img.shields.io/discord/843749923060711464?label=Join%20on%20Discord)](https://100ms.live/discord)
[![Firebase](https://img.shields.io/badge/Download%20Android-Firebase-green)](https://appdistribution.firebase.dev/i/7b7ab3b30e627c35)
[![TestFlight](https://img.shields.io/badge/Download%20iOS-TestFlight-blue)](https://testflight.apple.com/join/v4bSIPad)
[![Activity](https://img.shields.io/github/commit-activity/m/100mslive/react-native-hms.svg)](https://github.com/100mslive/react-native-hms/projects/1)
[![Register](https://img.shields.io/badge/Contact-Know%20More-blue)](https://dashboard.100ms.live/register)

# 100ms React Native SDK

📖 Read the Complete Documentation here: https://www.100ms.live/docs/react-native/v2/foundation/basics

## 🏃 Example App

📲 Download the Example iOS app here: https://testflight.apple.com/join/v4bSIPad

🤖 Download the Example Android app here: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35

To get a better understanding of how the example app is structured, what to do on `onJoin`, `onTrack` and `onPeer` listeners, creating `PeerTrackNodes`, how to use Redux, and what type of layouts and sorting you can implement in your app, checkout [Example App's README](https://github.com/100mslive/react-native-hms/blob/develop/example/README.md)


To run the Example app on your system, follow these steps -

1. In the project root, run `npm install`
2. Go to the example folder, `cd example`
3. In the example folder, run `npm install`
4. To run on Android, run `npx react-native run-android`
5. To run on iOS, first install the pods in iOS folder, `cd ios; pod install`. Then, set the Correct Development Team in Xcode Signing & Capabilities section. Then, in example folder, run `npx react-native run-ios`

Troubleshooting Guide for resolving issues in running the Example app is [available here](https://www.100ms.live/docs/react-native/v2/guides/faq#run-the-example-app).


## ☝️ Minimum Configuration

- Support for React Native 0.64.4 or above
- Support for Java 8 or above
- Support for Android API level 24 or above
- Xcode 13 or above
- Support for iOS 12 or above


## 🤝 Recommended Configuration

- React Native 0.68.0 or above
- Java 11 or above
- Android API level 32 or above
- Xcode 14 or above
- iOS 16 or above

## 📱 Supported Devices

- The Android SDK supports Android API level 21 and higher. It is built for armeabi-v7a, arm64-v8a, x86, and x86_64 architectures.
Devices running Android OS 11 or above is recommended.

- iPhone & iPads with iOS version 12 or above are supported.
Devices running iOS 16 or above is recommended.

## Installation

```bash
npm install @100mslive/react-native-hms --save
```

📲 Download the Sample iOS App here: https://testflight.apple.com/join/v4bSIPad

🤖 Download the Sample Android App here: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35

More information about Integrating the SDK is [available here](https://www.100ms.live/docs/react-native/v2/features/integration).

## 🔐 Permissions

### 📱 For iOS Permissions

Add following lines in `Info.plist` file

```xml
<key>NSCameraUsageDescription</key>
<string>Please allow access to Camera to enable video conferencing</string>
<key>NSMicrophoneUsageDescription</key>
<string>Please allow access to Microphone to enable video conferencing</string>
<key>NSLocalNetworkUsageDescription</key>
<string>Please allow access to network usage to enable video conferencing</string>
```

### 🤖 For Android Permissions

Add following permissions in `AndroidManifest.xml`

```xml
<uses-feature android:name="android.hardware.camera.autofocus"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

You will also need to request Camera and Record Audio permissions at runtime before you join a call or display a preview. Please follow [Android Documentation](https://developer.android.com/training/permissions/requesting#request-permission) for runtime permissions.

We suggest using [react-native-permission](https://www.npmjs.com/package/react-native-permissions) to acquire permissions from both platforms.

More information about Audio Video Permission on iOS & Android is [available here](https://www.100ms.live/docs/react-native/v2/features/integration#permissions).


## [QuickStart](https://www.100ms.live/docs/react-native/v2/guides/quickstart)


The package exports all the classes and a HMSSDK class that manages everything.

## [Setting up the HMS Instance](https://www.100ms.live/docs/react-native/v2/how--to-guides/install-the-sdk/hmssdk)

First invoke the `build` method which returns an instance of `HMSSDK`. Save this instance to perform all actions related to 100ms.

```ts
import { HMSSDK } from '@100mslive/react-native-hms';

/**
 * create HMSSDK instance using the build method & save it for further usage
 *
 * Important Note: Don't build new `HMSSDK` instance before destroying the previous one.
 * for more info checkout {@link https://www.100ms.live/docs/react-native/v2/how--to-guides/install-the-sdk/hmssdk#what-does-destroy-method-do}
 */
const hmsInstance = await HMSSDK.build();
```

## [Get Authentication Token](https://www.100ms.live/docs/react-native/v2/get-started/quickstart#fetch-token-to-join-the-room)

### Fetch token using room-code method (Recommended)

We can get the authentication token using room-code from meeting URL.

Let's understand the subdomain and code from the sample URL

In this sample url: `http://100ms-rocks.app.100ms.live/meeting/abc-defg-hij`
 -  Subdomain is `100ms-rocks`
 -  Room code is `abc-defg-hij`

Now to get the room-code from meeting URL, we can write our own logic or use the `getCode` method from [here](https://github.com/100mslive/react-native-hms/blob/main/example/src/utils/getRoomLinkDetails.ts)

To generate token we will be using `getAuthTokenByRoomCode` method available on `HMSSDK` instance. This method has `roomCode` as a required
parameter and `userId` & `endpoint` as optional parameter.

Let's checkout the implementation:

```js
/**
 * `getAuthTokenByRoomCode` returns a promise which is resolved with "auth token"
 * checkout {@link https://www.100ms.live/docs/react-native/v2/how--to-guides/install-the-sdk/hmssdk#what-does-destroy-method-do}
 */
const token = await hmsInstance.getAuthTokenByRoomCode('YOUR_ROOM_CODE');

/**
 * Create `HMSConfig` with the above auth token and username
 */
const hmsConfig = new HMSConfig({ authToken: token, username: 'John Appleseed' });
```

### Get temporary token from dashboard

To test audio/video functionality, you need to connect to a 100ms Room. Please check the following steps for the same -

1. Navigate to your [100ms dashboard](https://dashboard.100ms.live/dashboard) or [create an account](https://dashboard.100ms.live/register) if you don't have one.
2. Use the `Video Conferencing Starter Kit` to create a room with a default template assigned to it to test this app quickly.
3. Go to the [Rooms page](https://dashboard.100ms.live/rooms) in your dashboard, click on the `Room Id` of the room you created above, and click on the `Join Room` button on the top right.
4. You will see 100ms demo URLs for the roles created when you deployed the starter kit; you can click on the 'key' icon to copy the token and update the `AUTH_TOKEN` variable in "App.js" file.
    > Token from 100ms dashboard is for testing purposes only, For production applications you must generate tokens on your own server. Refer to the [Management Token section](/concepts/v2/concepts/security-and-tokens#management-token) in Authentication and Tokens guide for more information.


## [Add Event Listeners](https://www.100ms.live/docs/react-native/v2/features/event-listeners)

Add Event Listeners to get notified about actions happening in the 100ms Room.

The most commonly used Events are `onJoin`, `onPeerUpdate` & `onTrackUpdate`. All the available actions can be found in the `HMSUpdateListenerActions` class.

The Event Listeners are to be used for handling any update happening in 100ms Room.

```ts
const hmsInstance = await HMSSDK.build();

// instance acquired from build() method
hmsInstance.addEventListener(
  HMSUpdateListenerActions.ON_JOIN,
  joinSuccess, // function that will be called Joining a Room is successful
);
```

The detailed QuickStart Guide is [available here](https://www.100ms.live/docs/react-native/v2/guides/quickstart).


## [Join the Room](https://www.100ms.live/docs/react-native/v2/features/join)

To interact with _peers_ in audio or video call, the user needs to **Join** a **Room**.

When user indicates that they want to join the room, your app should have -

1. User Name - The name which should be displayed to other peers in the room.

2. Authentication Token - The Client side Authentication Token generated by the Token Service. Details about how to create Auth Tokens are [available here](https://www.100ms.live/docs/react-native/v2/guides/token).

Additionally, you can also pass these fields while Joining a Room -

1. Track Settings - Such as joining a Room with Muted Audio or Video using the `HMSTrackSettings` object. More information is [available here](https://www.100ms.live/docs/react-native/v2/features/join#join-with-muted-audio-video).

2. Peer Metadata - This can be used to pass any additional metadata associated with the user using `metadata` of `HMSConfig` object. For Eg: user-id mapping at the application side. More information is [available here](https://www.100ms.live/docs/react-native/v2/advanced-features/change-metadata).


NOTE: `ON_JOIN` Event Listener must be **attached** before calling `join` function to receive the event callback.

```ts
// create HMSSDK instance using the build function
const hmsInstance = await HMSSDK.build();

// Generate 100ms Auth Token by Room Code
const token = await hmsInstance.getAuthTokenByRoomCode('abc-defg-hij'); // Sample Room Code

// You'll need to add Event Listeners for HMSUpdateListenerActions, which are invoked to notify about updates happening in the room like a peer joins/leaves, a track got muted/unmuted, any errors that occur, etc.
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinSuccess);
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, onPeerUpdate);
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackUpdate);
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);


// Next, create an object of HMSConfig class using the available joining configurations.
let config = new HMSConfig({
                    authToken: token, // client-side token generated by `getAuthTokenByRoomCode` method
                    username: 'John Appleseed',
                });

// Now, we are primed to join the room. All you have to do is calling join by passing the config object
hmsInstance.join(config);
```

More information about Joining a Room is [available here](https://www.100ms.live/docs/react-native/v2/features/join).


## Basic Mechanism of using 100ms APIs

For invoking any actions simply use the `HMSSDK` instance created in above steps. Few common examples of using it are as follows -

```ts
// To Mute Audio of local peer - other peers will stop hearing audio
hmsInstance?.localPeer?.localAudioTrack()?.setMute(true);

// To Mute Video of local peer - other peers will stop seeing video
hmsInstance?.localPeer?.localVideoTrack()?.setMute(true);

// Switch Camera from Front to Back or vice-versa
hmsInstance?.localPeer?.localVideoTrack()?.switchCamera();

// Leave the ongoing Room (async function)
await hmsInstance?.leave();

// To send a Chat Message to all peers in Room
await hmsInstance?.sendBroadcastMessage('Hello Everyone! 👋');
```

More information about using `HMSSDK` APIs is [available here](https://www.100ms.live/docs/react-native/v2/guides/quickstart).

## [Viewing the Video](https://www.100ms.live/docs/react-native/v2/features/render-video)

It all comes down to this. All the setup so far has been done so that we can show Live Streaming Video in our beautiful apps.

100ms React Native SDK provides `HmsView` component that renders the video on the screen. You can access `HmsView` from the `HMSSDK` instance created in above steps.

We simply have to pass a Video Track's `trackId` to the `HmsView` to begin automatic rendering of Live Video Stream.

We can also optionally pass props like `key`, `scaleType`, `mirror` to customize the `HmsView` component.

```ts
// get HmsView from the HMSSDK instance created earlier
const HmsView = hmsInstance.HmsView;

<HmsView
  trackId={videoTrackId}
  key={videoTrackId}
  style={styles.hmsView}
/>

const styles = StyleSheet.create({
  hmsView: {
    height: '100%',
    width: '100%',
  },
});
```

- One `HmsView` component can only be connected with one video `trackId`. To display multiple videos you have to create multiple instances of `HmsView` component.

- It's recommended to always pass the `key` property while creating `HmsView`. If a null or undefined `trackId` is passed in `HmsView` you will have to unmount and remount with the new `trackId`. Using the `key` prop and passing `trackId` to it automatically achieves this.

- `HmsView` component requires  `width` and `height` in `style` prop to set bounds of the tile that will show the video stream.

- Once the requirement of that `HmsView` is finished it should **ALWAYS** be disposed.

- Recommended practice is to show maximum of 3 to 4 `HmsView` on a single page/screen of the app. This avoids overloading network data consumption & video decoding resources of the device.

More information about Rendering Videos is [available here](https://www.100ms.live/docs/react-native/v2/features/render-video).


## [Using Track Updates to display Videos](https://www.100ms.live/docs/react-native/v2/features/render-video)

Always use ON_PEER_UPDATE and ON_TRACK_UPDATE listeners, these listeners get updated localPeer and remotePeers whenever there is any event related to these values.
The following code snippet shows a simple example of attaching Track Updates Event Listener & using it to show a Video.

```ts
// In this example code snippet, We are keeping things very simple.
// You will get an overview of how to render `HMSView`s for list of `trackId`s and how to keep that list up to date.
// We don't need `ON_PEER_UPDATE` event listener for keeping track of only `trackId`s.
// So, we have registered only `ON_TRACK_UPDATE` event listener here

const [trackIds, setTrackIds] = useState<string[]>([]);

const onTrackListener = (data: { peer: HMSPeer; track: HMSTrack; type: HMSTrackUpdate }) => {
  // We will only consider Video tracks for this example
  if (data.track.type !== HMSTrackType.VIDEO) return;

  // If Video track is added, add trackId to our list
  if (data.type === HMSTrackUpdate.TRACK_ADDED) setTrackIds(prevTrackIds => [...prevTrackIds, data.track.trackId]);

  // If Video track is removed, remove trackId from our list
  if (data.type === HMSTrackUpdate.TRACK_REMOVED) setTrackIds(prevTrackIds => prevTrackIds.filter(prevTrackId => prevTrackId !== data.track.trackId));
};

hmsInstance.addEventListener(
  HMSUpdateListenerActions.ON_TRACK_UPDATE,
  onTrackListener
);

// Render multiple HMSView for trackIds inside FlatList
// Note: HMSView will render blank if video track of peer is muted, Make sure video of peers is not muted.
<FlatList
  data={trackIds} // trackIds is an array of trackIds of video tracks
  keyExtractor={(trackId) => trackId}
  renderItem={({ item }) => <HMSView key={item} trackId={item} style={{ width: '100%', height: 300 }} {...} />}
  {...}
/>
```

More information about Rendering Videos is [available here](https://www.100ms.live/docs/react-native/v2/features/render-video).



### 🚂 [Example Implementations](https://github.com/100mslive/react-native-hms/tree/main/example)

In the [100ms Example App](https://github.com/100mslive/react-native-hms/tree/main/example) we have shown how to set up the various listeners, what data to store in Redux and what all features you can implement.

We have also implemented multiple views which are commonly used. Checkout the [videos & relevant code in the Example app](https://github.com/100mslive/react-native-hms/tree/main/example#additional-features).


📖 Read the Complete Documentation here: https://www.100ms.live/docs/react-native/v2/foundation/basics
