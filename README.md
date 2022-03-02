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
<key>NSLocalNetworkUsageDescription</key>
<string>Please allow access to network usage to enable video conferencing</string>
<key>NSMicrophoneUsageDescription</key>
<string>Please allow access to Microphone to enable video conferencing</string>
```

### For Android Permissions

Add following permissions in `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

You will also need to request Camera and Record Audio permissions at runtime before you join a call or display a preview. Please follow [Android Documentation](https://developer.android.com/training/permissions/requesting#request-permission) for runtime permissions.

We suggest using [react-native-permission](https://www.npmjs.com/package/react-native-permissions) to acquire permissions from both platforms.

## QuickStart

The package exports all the classes and a HMSSDK class that manages everything.

# Setting up the HMS Instance:

first we'll have to call build method, that method returns an instance of HMSSDK class and the same is used to perform all the operations

```js
import { HMSSDK } from '@100mslive/react-native-hms';
...

const hmsInstance = await HMSSDK.build();
// save this instance, it will be used for all the operations that we'll perform

...
```

# Add event listeners

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

# Join the room

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

# Viewing the video of a peer

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

# Display a video in HmsView

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
// sink is passed false video would be removed. It is a ios only prop, for android it is handled by the package itself.
// scaleType can be selected from HMSVideoViewMode as required
// mirror can be passed as true to flip videos horizontally
<HmsView sink={true} style={styles.hmsView} trackId={trackId} mirror={true} scaleType={HMSVideoViewMode.ASPECT_FIT} />

...
```

# Calling various functions of HMS

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

# Sending messages

```js
import { HMSRole, HMSPeer } from '@100mslive/react-native-hms';

const message = 'hello'
const roles: HMSRole[] = hmsInstance?.knownRoles
// any remote peer
const peer: HMSPeer = hmsInstance?.remotePeers[0]

// send a different type of messages
hmsInstance?.sendBroadcastMessage(message);
hmsInstance?.sendGroupMessage(message, [role[0]);
hmsInstance?.sendDirectMessage(message, peer);
```

# Error handling

```js
import { HMSUpdateListenerActions } from '@100mslive/react-native-hms';

// add an error event listener
hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
```

