# react-native-hmssdk

React native wrapper for 100ms SDK

## Installation

```sh
npm install react-native-hmssdk
```

## Usage

```js
import HmsManager, {HmsView} from "react-native-hmssdk";

// Joining the room
HmsManager.join()

// attach event listener for join action
HmsManager.addEventListener('ON_JOIN', callBackSuccess);

// define callback success
const callBackSuccess = (data) => {
  // get track Ids after join successful
  HmsManager.getTrackIds(
    ({ remoteTracks, localTrackId }) => {
      setLocalTrackId(localTrackId)
      setRemoteTrackIds(remoteTracks);
    });
};

// display video feed of a track in HmsView Component
<HmsView trackId={localTrackId} style={styles.view} />


```

## Setup and installation for example app

clone the project by using commands

ssh
```
git@github.com:lavi-moolchandani/hmssdk.git
```

or http
```
https://github.com/lavi-moolchandani/hmssdk.git
```

## Permissions
for iOS add these permissions in your info.plist file

Privacy - Local Network Usage Description

Privacy - Microphone Usage Description

Privacy - Camera Usage Description


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
