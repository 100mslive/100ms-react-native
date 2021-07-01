# react-native-hmssdk

React native wrapper for 100ms SDK

## Installation

```sh
npm install react-native-hmssdk
```

## Usage

```js
import Hmssdk from "react-native-hmssdk";

// ...

<HmssdkViewManager
  color="#32a852"
  credentials={{ userId, roomId, authToken }}
  style={styles.box}
  layout={{ width, height }}
  isMute={isMute}
  switchCamera={switchCamera}
  muteVideo={muteVideo}
/>

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


## Props

| Prop                | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| **`color`**         | Sets the background color of component                                   |
| **`credentials`**   | Set required credentials of user: { userId, roomId, authToken }          | 
| **`style`**         | Style properties of outer component                                      |
| **`layout`**        | Object that takes width and height to set the component size.            |
| **`isMute`**        | Boolean value to switch current user's microphone (on/off)               |
| **`switchCamera`**  | Boolean value to switch current user's camera (front/back)               |
| **`muteVideo`**     | Boolean value to switch current user's Video streaming                   |

## License

MIT
