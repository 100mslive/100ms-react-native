<a href="https://100ms.live/">
<img src="https://github.com/100mslive/100ms-react-native/blob/main/100ms.gif" height=256/> 
<img src="https://github.com/100mslive/100ms-react-native/blob/main/100ms.svg" title="100ms logo" float=center height=256>
</a>

# react-native-hms

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

React native wrapper for 100ms SDK

## Run Example App

To run the example app on your system, follow these steps -

1. In the project root, run `npm install`
2. Go to the example folder, `cd example`
3. In the example folder, run `npm install`
4. To run on Android, run `npx react-native run-android`
5. To run on iOS, first install the pods in iOS folder, `cd ios; pod install`. Then, set the development team in Singning & Capabilities and exclude architectures in Build Settings as shown below. Then, in example folder, run `npx react-native run-ios`

![Development Team](https://user-images.githubusercontent.com/56931905/192695357-b48b093b-965a-4f02-8d9d-54bf25ac6ec3.png)

![Excluded Architectures](https://user-images.githubusercontent.com/56931905/192695425-71329dcd-c797-468b-866c-8be3fd86e8f4.png)

To get a better understanding of how the example app is stuctured, what to do on onJoin, onTrack and onPeer listeners, when to use redux, and what type of layouts and sorting you can implement in your app, checkout example app's [README](https://github.com/100mslive/react-native-hms/blob/develop/example/README.md)

## ☝️ Minimum Configuration

- Support for Android API level 21 or higher
- Support for Java 8
- Support for iOS 10 or higher
- Support for React Native 0.63.3 or higher
- Xcode 12 or higher

## 🤝 Recommended Configuration

- Android API level 29 or higher
- Java 11 or higher
- iOS 15 or higher
- React Native 0.64.2 or higher
- Xcode 13 or higher

## 📱 Supported Devices

- The Android SDK supports Android API level 21 and higher. It is built for armeabi-v7a, arm64-v8a, x86, and x86_64 architectures.

- iPhone & iPads with iOS version 10 or higher.

## Installation

```bash
npm install @100mslive/react-native-hms --save
```

📲 Download the Sample iOS App here: https://testflight.apple.com/join/v4bSIPad

🤖 Download the Sample Android App here: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35

## Permissions

### For iOS Permissions

Add following lines in `Info.plist` file

```xml
<key>NSCameraUsageDescription</key>
<string>Please allow access to Camera to enable video conferencing</string>
<key>NSMicrophoneUsageDescription</key>
<string>Please allow access to Microphone to enable video conferencing</string>
<key>NSLocalNetworkUsageDescription</key>
<string>Please allow access to network usage to enable video conferencing</string>
```

### For Android Permissions

Add following permissions in `AndroidManifest.xml`

```xml
<uses-feature android:name="android.hardware.camera.autofocus"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

You will also need to request Camera and Record Audio permissions at runtime before you join a call or display a preview. Please follow [Android Documentation](https://developer.android.com/training/permissions/requesting#request-permission) for runtime permissions.

We suggest using [react-native-permission](https://www.npmjs.com/package/react-native-permissions) to acquire permissions from both platforms.

## [QuickStart](https://www.100ms.live/docs/react-native/v2/guides/quickstart)

The package exports all the classes and a HMSSDK class that manages everything.

## Setting up the HMS Instance

first we'll have to call build method, that method returns an instance of HMSSDK class and the same is used to perform all the operations

```js
import { HMSSDK } from '@100mslive/react-native-hms';
...

const hmsInstance = await HMSSDK.build();
// save this instance, it will be used for all the operations that we'll perform

...
```

## [Add event listeners](https://www.100ms.live/docs/react-native/v2/features/event-listeners)

add event listeners for all the events such as onPreview, onJoin, onPeerUpdate etc. the actions can be found in HMSUpdateListenerActions class

```js
import { HMSUpdateListenerActions } from '@100mslive/react-native-hms';
...

// instance acquired from build() method
hmsInstance.addEventListener(
  HMSUpdateListenerActions.ON_PREVIEW,
  previewSuccess, // function that will be called on Preview success
);

...
```

The event handlers are the way of handling any update happening in hms all events can be found in HMSUpdateListenerActions class

## [Error handling](https://www.100ms.live/docs/react-native/v2/features/error-handling)

```js
import { HMSUpdateListenerActions } from '@100mslive/react-native-hms';

// add an error event listener
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
```

## [Join the room](https://www.100ms.live/docs/react-native/v2/features/join)

Joining the room connects you to the remote peer and broadcasts your stream to other peers, we need instance of HMSConfig in order to pass the details of room and user to join function

```js
import { HMSUpdateListenerActions, HMSConfig } from '@100mslive/react-native-hms';
...

const HmsConfig = new HMSConfig({authToken, userID, roomID});

// instance acquired from build() method
hmsInstance.preview(HmsConfig); // to start preview
// or
hmsInstance.join(HmsConfig); // to join a room

...
```

don't forget to add ON_JOIN listener before calling join to receive an event callback

## Calling various functions of HMS

```js
// Mute Audio
hmsInstance?.localPeer?.localAudioTrack()?.setMute(true);

// Stop Video
hmsInstance?.localPeer?.localVideoTrack()?.setMute(true);

// Switch Camera
hmsInstance?.localPeer?.localVideoTrack()?.switchCamera();

// Leave the call (async function)
await hmsInstance?.leave();
```

## [Viewing the video of a peer](https://www.100ms.live/docs/react-native/v2/features/render-video)

To display a video on screen the package provide a UI component named HmsView that takes the video track ID and displays the video in that component, this component requires on _width_ and _height_ in _style_ prop to set bounds of the tile that will show the video stream

```js
...
import { HMSRemotePeer } from '@100mslive/react-native-hms';

// getting local track ID
const localTrackId: string = hmsInstance?.localPeer?.videoTrack?.trackId;

// getting remote track IDs
const remotePeers: HMSRemotePeer[] = hmsInstance?.remotePeers
const remoteVideoIds: string[] = [];

remotePeers.map((remotePeer: HMSRemotePeer) => {
  const remoteTrackId: string = remotePeer?.videoTrack?.trackId;

  if (remoteTrackId) {
    remoteVideoIds.push(remoteTrackId);
  }
});

...
```

## [Display a video in HmsView](https://www.100ms.live/docs/react-native/v2/features/render-video)

```js
import { HMSVideoViewMode } from '@100mslive/react-native-hms';

// instance acquired from build() method
const HmsView = hmsInstance?.HmsView;
...
const styles = StyleSheet.create({
  hmsView: {
    height: '100%',
    width: '100%',
  },
});

// trackId can be acquired from the method explained above
// scaleType can be selected from HMSVideoViewMode as required
// mirror can be passed as true to flip videos horizontally
<HmsView style={styles.hmsView} trackId={trackId} mirror={true} scaleType={HMSVideoViewMode.ASPECT_FIT} />

...
```

## [Mute/Unmute others](https://www.100ms.live/docs/react-native/v2/features/change-track-state)

```js
const mute: boolean = true;

// hms instance acquired by build methodhmsInstance?.changeTrackState(audioTrack as HMSTrack, mute);
hmsInstance?.changeTrackState(videoTrack as HMSTrack, mute);

const unmute: boolean = false;

await hmsInstance?.changeTrackState(audioTrack as HMSTrack, unmute);
await hmsInstance?.changeTrackState(videoTrack as HMSTrack, unmute);
```

## [End Room for all](https://www.100ms.live/docs/react-native/v2/features/end-room)

```js
const reason = 'Host ended the room';
const lock = false; // optional parameter

// hms instance acquired by build method
await hmsInstance.endRoom(reason, lock);
```

## [Remove Peer](https://www.100ms.live/docs/react-native/v2/features/remove-peer)

```js
import { HMSPeer } from '@100mslive/react-native-hms';

const reason = 'removed from room';

// hms instance acquired by build method
const peer: HMSPeer = hmsInstance?.remotePeers[0];

await hmsInstance.removePeer(peer, reason);
```

## [Sending messages](https://www.100ms.live/docs/react-native/v2/features/chat)

```js
import { HMSRole, HMSPeer } from '@100mslive/react-native-hms';

const message = 'hello'
const roles: HMSRole[] = hmsInstance?.knownRoles
// any remote peer
const peer: HMSPeer = hmsInstance?.remotePeers[0]

// send a different type of messages
await hmsInstance?.sendBroadcastMessage(message);
await hmsInstance?.sendGroupMessage(message, [role[0]);
await hmsInstance?.sendDirectMessage(message, peer);
```

## [Role Change](https://www.100ms.live/docs/react-native/v2/features/change-role)

```js
import { HMSRole, HMSRemotePeer } from '@100mslive/react-native-hms';
// hms instance acquired by build method
const roles: HMSRole[] = hmsInstance?.knownRoles;
const newRole: HMSRole = roles[0];

// can any remote peer
const peer: HMSRemotePeer = hmsInstance?.remotePeers[0];

const force = false;

await hmsInstance.changeRole(peer, newRole, force); // request role change
await hmsInstance.changeRole(peer, newRole, !force); // force role change
```

## [Raise Hand & BRB](https://www.100ms.live/docs/react-native/v2/advanced-features/change-metadata)

```js
const parsedMetadata = JSON.parse(hmsInstance?.localPeer?.metadata);

// Raise Hand
// hms instance acquired by build method
await hmsInstance?.changeMetadata(
  JSON.stringify({
    ...parsedMetadata,
    isHandRaised: true,
  })
);

// BRB
// hms instance acquired by build method
await hmsInstance?.changeMetadata(
  JSON.stringify({
    ...parsedMetadata,
    isBRBOn: true,
  })
);
```

## [HLS Streaming](https://www.100ms.live/docs/react-native/v2/features/hls-streaming)

```js
import {
  HMSHLSMeetingURLVariant,
  HMSHLSConfig,
} from '@100mslive/react-native-hms';

const startHLSStreaming = () => {
  // Default Settings
  await hmsInstance.startHLSStreaming()

  // Custom Settings
  const hmsHLSMeetingURLVariant = new HMSHLSMeetingURLVariant({
    meetingUrl: 'https://yogi.app.100ms.live/preview/nih-bkn-vek?skip_preview=true',
    metadata: '',
  });

  const hmsHLSRecordingConfig = new HMSHLSRecordingConfig({
    singleFilePerLayer: false,
    videoOnDemand: false,
  });

  const hmsHLSConfig = new HMSHLSConfig({
    hlsRecordingConfig: hmsHLSRecordingConfig,
    meetingURLVariants: [hlsStreamingDetails],
  });

  await hmsInstance.startHLSStreaming(hmsHLSConfig)
    .then(d => console.log('Start Hls Success: ', d))
    .catch(e => console.log('Start Hls Error: ', e));
};
```

## [Start Streaming / Recording](https://www.100ms.live/docs/react-native/v2/features/recording)

```js
import { HMSRTMPConfig } from '@100mslive/react-native-hms';

const recordingDetails = HMSRTMPConfig({
  record: true,
  meetingURL: roomID + '/viewer?token=beam_recording',
  rtmpURLs: [], // optional value
  resolution: { height: 720, width: 1280 }, // optional value
  // Resolution width
  // Range is [500, 1280].
  // Default value is 1280.
  // If resolution height > 720 then max resolution width = 720.

  // Resolution height
  // Reange is [480, 1280].
  // Default resolution width is 720.
  // If resolution width > 720 then max resolution height = 720.
});

// hms instance acquired by build method
await hmsInstance?.startRTMPOrRecording(recordingDetails);
```

## [Get RTC Stats](https://www.100ms.live/docs/react-native/v2/features/rtc-stats)

```js
// hms instance acquired by build method
hmsInstance?.enableRTCStats();
```

## [Screenshare](https://www.100ms.live/docs/react-native/v2/features/screenshare)

```js
// hms instance acquired by build method
await hmsInstance?.startScreenshare();
```

## [Getting Audio Levels for all speaking peers](https://www.100ms.live/docs/react-native/v2/advanced-features/show-audio-level)

```js
import {
  HMSUpdateListenerActions,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

// hms instance acquired by build method
hmsInstance?.addEventListener(HMSUpdateListenerActions.ON_SPEAKER, onSpeaker);

const onSpeaker = (data: HMSSpeaker[]) => {
  data?.map((speaker: HMSSpeaker) =>
    console.log('speaker audio level: ', speaker?.level)
  );
};
```

## [Local mute others](https://www.100ms.live/docs/react-native/v2/features/playback-allowed)

```js
const remotePeer: HMSRemotePeer;
const isAudioPlaybackAllowed = remotePeer.remoteAudioTrack().setPlaybackAllowed(false);
const isVideoPlaybackAllowed = remotePeer.remoteVideoTrack().setPlaybackAllowed(true);

// hms instance acquired by build method
hmsInstance.setPlaybackForAllAudio(true)  // mute
hmsInstance.setPlaybackForAllAudio(false) // unmute
```

## [Locally Set Volume](https://www.100ms.live/docs/react-native/v2/advanced-features/set-volume)

```js
const volume: Float = 1.0;
const track: HMSTrack = remotePeer.audioTrack as HMSTrack;

// hms instance acquired by build method
hmsInstance?.setVolume(track, volume);
```

## [Change Name](https://www.100ms.live/docs/react-native/v2/features/change-name)

```js
const newName: string = 'new name';

// hms instance acquired by build method
await hmsInstance.changeName(newName);
```

## [Join with specific Track Settings](https://www.100ms.live/docs/react-native/v2/advanced-features/track-settings)

```js
const getTrackSettings = () => {
  let audioSettings = new HMSAudioTrackSettings({
    maxBitrate: 32,
    trackDescription: 'Simple Audio Track',
  });
  let videoSettings = new HMSVideoTrackSettings({
    codec: HMSVideoCodec.vp8,
    maxBitrate: 512,
    maxFrameRate: 25,
    cameraFacing: HMSCameraFacing.FRONT,
    trackDescription: 'Simple Video Track',
    resolution: new HMSVideoResolution({ height: 180, width: 320 }),
  });

  return new HMSTrackSettings({ video: videoSettings, audio: audioSettings });
};

const setupBuild = async () => {
  const trackSettings = getTrackSettings();
  const build = await HMSSDK.build({ trackSettings });
  setInstance(build);
  updateHms({ hmsInstance: build });
};
```
