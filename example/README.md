## Description of the workflow of example app

This will help you understand the workflow of the example app like what to do in the various listeners, what data to store in the redux and what all features you can implement.

### PeerTrackNodes

The example app stands on a array of PeerTrackNode structure which includes all the all the peers that have joined the room. These peerTrackNodes are created in onTrackListener and onPeerListener depending on whenever a peer is added or a track is added. Once created this array of peerTrackNodes you can render this using a flatlist. 

> Recommended not to render more that 2 to 4 peerTrackNodes on a single page

It includes a unique id, peer and optional video track. 

```js 
type PeerTrackNode = {
  id: string;
  peer: HMSPeer;
  track?: HMSVideoTrack;
};
```
* PeerTrackNodes should only be created in onPeerListener (PEER_JOINED) or onTrackListener (TRACK_ADDED) updates. 
* Before creating a peerTrackNode we should traverse through the array of peerTrackNodes and check if the peerTrackNode is present then update it otherwise create it. 
* Creating of peerTrackNodes in onTrackListener would be only if the HMSTrackSource is non regular and HMSTrackType is video (which means either a screen is shared or a external video is played). 
* Also push all the non-regular tracks to the front of the array so that they are not rendered in between all the peerTrackNodes. 
* You may want to avoid creating a peerTrackNode for a local screenshare, for that you can add the following condition.
```js
  !(track.source === HMSTrackSource.SCREEN && peer.isLocal)
```

* PeerTrackNodes should only be removed in onPeerListener (PEER_LEFT) or onTrackListener (TRACK_REMOVED) updates. 
* Removing peerTrackNode in onTrackListener should only be done when the HMSTrackSource is non-regular (which means either the screenshare or a external video is stopped) and whenever a peer's role is changed to hls-viewer because then you might want to show a different UI (hls streaming video).
* PeerTrackNodes should be updated in all the other updates coming in onPeerListener and onTrackListener

### onJoinListener

Using onJoinListener is very simple. Create a peerTrackNode for updated localPeer state you receive in onJoinListener. Save the peerTrackNodes array and hmsInstance in redux. When you join a room the default state of your audio and video is unmuted so you may want to join with a muted audio and video, you can call the following functions 
```js
  instance?.localPeer?.localVideoTrack()?.setMute(true);
  instance?.localPeer?.localAudioTrack()?.setMute(true);
```

### Redux

As we already know through redux we can use one application state as a global state and interact with the state from any react component is very easy whether they are siblings or parent-child. Redux in this application is used for three purposes which is saving userState, appState and messageState. UserState stores the userName, mirroring state of user's video, the room state which includes roomId, roomCode and hmsInstance. AppState stores the peerTrackNodes array created while previewing. MessageState stores the array of hmsMessages used while displaying the chat window.

### Additional Features

This example app provides some additional features like setting of different view layouts (Audio Only, Grid, Active Speaker, Hero, Mini) and different types of sorting of peerTrackNodes (Alphabetical, Video on, Role based). 

* Audio Only Layout as the name suggests shows peerTrackNodes with a avatar tile without videos. 

https://user-images.githubusercontent.com/56931905/174608305-7beb34cb-ae27-424e-94e8-796722d537f0.mov


* Grid Layout is 2x2 default view. 

https://user-images.githubusercontent.com/56931905/174608497-67436247-5061-4a59-a516-8fa8504c3e73.mov


* Active Speaker View is also a 2x2 grid view, sorting the active speakers to the first page. 

https://user-images.githubusercontent.com/56931905/174608522-ee95fa50-2082-4bff-b466-4e013513216f.mov


* Hero View shows the dominant speaker in the main tile and others in a flatList below it. 

https://user-images.githubusercontent.com/56931905/174608541-85fc5991-8eea-4e03-86a5-33da13f93813.mov


* Mini View is a one on one Video call view. 

https://user-images.githubusercontent.com/56931905/174608574-90b18af7-6e59-4a4f-9359-dd7b90177532.mov



You can also sort the peerTrackNodes in different order depending on the type of sorting. The non regular video tracks (screenshare and external video) will always be pinned to first after that the remaining grid view is sorted according to the sorting type. 
* Alphabetical sorting sorts the peerTrackNodes on the bases on the peer name. 

https://user-images.githubusercontent.com/56931905/174608619-96b056ef-8292-4925-819b-bb89c9afa795.mov


* Video on sorting sorts the peerTrackNodes on the bases of the mute param of the track property in peerTrackNodes. 

https://user-images.githubusercontent.com/56931905/174608639-e489f4ba-57e2-463d-a87e-cc6fb24b531d.mov


* Role based sorting sorts the peerTrackNodes on the bases of peer's role priority. 

https://user-images.githubusercontent.com/56931905/174608678-28bc9386-3d6e-4a2c-a5dd-bf360e0a48f8.mov


### PIP (Picture-In-Picture) Mode

100ms React Native SDK provides support for creating Picture in Picture mode experience for video calls.

PIP Mode lets the user watch the room video in a small window pinned to a corner of the screen while navigating between apps or browsing content on the main screen.

Currently this functionality is only available on Android.

https://user-images.githubusercontent.com/45194090/205296059-6b9b399d-9a51-4d35-99cf-4413f6368169.mp4

