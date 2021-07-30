# react-native-hms

React native wrapper for 100ms SDK

## Installation

```sh
npm install react-native-hms

cd ios/ && pod install
```

## Usage

```js
import HmsManager, {HmsView} from "react-native-hms";

// builds the SDK for HMS, required to call before any interaction with SDK
HmsManager.build()

// attach event listener for join action
HmsManager.addEventListener('ON_JOIN', callBackSuccess);

// Joining the room
HmsManager.join()

// define callback success
const callBackSuccess = (data) => {
  // This callback is triggered after join successful
};

// This function calls the callback function passed after successful completion
HmsManager.getTrackIds(({remoteTrackIds, localTrackId}) => {})

// display video feed of a track in HmsView Component
<HmsView trackId={localTrackId} style={styles.view} />

// Mute/Unmute current User
HmsManager.setLocalPeerMute(isMute: Bool)

// Turn camera on/off
HmsManager.setLocalPeerVideoMute(isMute: Bool)

// switch camera (front/back)
HmsManager.switchCamera()

```

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


## Hms Manager functions

| Prop                        | Description                                                              | Required Parameters
| -------------------         | ------------------------------------------------------------------------ |-----------------------------------------
| **`join`**                  | Takes user creadentials and joins user to the room                       | creadentials: Object({ userId, roomId, authToken })
| **`getTrackIds`**           | Returns current track Ids in a callback -> { remoteTracks, localTrackId }| callback: Function 
| **`setLocalPeerMute`**      | Sets mute value of local peer                                            | isMute: Boolean
| **`setLocalPeerVideoMute`** | Sets current user's video (on/off)                                       | isMute: Boolean
| **`switchCamera`**          | Switch current user's camera (front/back)                                | None
| **`addEventListener`**      | Attaches event listner callback to a specific action                     | (action: "string" callback: function)

## HmsView Props

| Prop                        | Description                                                              |
| -------------------         | ------------------------------------------------------------------------ |
| **`trackId`**               | TrackId of a local/remote Peer's track that is to be rendered in View    |
| **`style`**                 | styles to be passed for the container view of view Track                 |


## License

MIT
