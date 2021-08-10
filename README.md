# react-native-hms
![npm](https://img.shields.io/npm/v/@100mslive/react-native-hms)
![license](https://img.shields.io/npm/l/@100mslive/react-native-hms)
![quality](https://img.shields.io/npms-io/quality-score/@100mslive/react-native-hms)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@100mslive/react-native-hms)
![collaborators](https://img.shields.io/npm/collaborators/@100mslive/react-native-hms)
[![Documentation](https://img.shields.io/badge/Read-Documentation-blue)](https://docs.100ms.live/)
[![Slack](https://img.shields.io/badge/Community-Join%20on%20Slack-blue)](https://join.slack.com/t/100mslive/shared_invite/zt-llwdnz11-vkb2RzptwacwXHO7UeY0CQ)
[![Email](https://img.shields.io/badge/Contact-Know%20More-blue)](mailto:founders@100ms.live)

React native wrapper for 100ms SDK

## Installation

```sh
npm install react-native-hms

cd ios/ && pod install
```
Note: Only iOS platform is supported at the moment, we are actively working to support Android as well.
Download the Sample iOS App here: https://testflight.apple.com/join/v4bSIPad

## Permissions
Add following permissions in info.plist file
```
<key>NSLocalNetworkUsageDescription</key>
<string>{YourAppName} App wants to use your local network</string>

<key>NSMicrophoneUsageDescription</key>
<string>{YourAppName} wants to use your microphone</string>

<key>NSCameraUsageDescription</key>
<string>{YourAppName} wants to use your camera</string>

```


## QuickStart
The package exports four Classes and an HMSManager class that manages everything.

# Setting up the HMS Instance:
first we'll have to call build method, that method returns an instance of HMSManager class and the same is used to perform all the operations
```js
import HmsManager from 'react-native-hms';
...

const hmsInstance = await HmsManager.build();
//save this instance, will be used for all the operations that we'll perform

...
```

# Add event listeners
add event listeners for all the events such as onPreview, onJoin, onPeerUpdate etc. the actions can be found in HMSUpdateListenerActions class
```js
import HmsManager, {
  HMSUpdateListenerActions,
} from 'react-native-hms';
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
import HmsManager, {
  HMSUpdateListenerActions,
  HMSConfig,
} from 'react-native-hms';
...

// instance acquired from build() method
const HmsConfig = new HMSConfig({authToken, userID, roomID});
instance.preview(HmsConfig); // to start preview
// or 
instance.join(HmsConfig); // to join a room

...
```
don't forget to add ON_JOIN listener before calling join to receive an event callback

# Viewing the video of a peer
To display a video on screen the package provide a UI component named HmsView that takes the video track ID and displays the video in that component, this component requires on *width* and *height* in *style* prop to set bounds of the tile that will show the video stream
```js
...

//getting local track ID
const localTrackId = instance?.localPeer?.videoTrack?.trackId;

// getting remote track IDs
const remotePeers = instance?.remotePeers
const remoteVideoIds: string[] = [];

remotePeers.map((remotePeer: any) => {
  const remoteTrackId = remotePeer?.videoTrack?.trackId;

  if (remoteTrackId) {
    remoteVideoIds.push(remoteTrackId);
  }
});

...
```

# Display a video in HmsView
```js
import { HmsView } from 'react-native-hms';

...
const styles = StyleSheet.create({
  hmsView: {
    height: '100%',
    width: '100%',
  },
});

// trackId can be acquired from the method explained above
<HmsView style={styles.hmsView} trackId={trackId} />

...
```

# Calling various functions of HMS
```js

// Mute Audio
instance.localPeer.localAudioTrack().setMute(isMute);

// Stop Video
instance.localPeer.localVideoTrack().setMute(muteVideo);

// Switch Camera
instance.localPeer.localVideoTrack().switchCamera();

// Leave the call
instance.leave()

```


## License

MIT
