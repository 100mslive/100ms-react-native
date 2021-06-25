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
  userId={userId}
  roomId={roomId}
  authToken={token}
  style={styles.box}
  layout={{ width, height }}
  isMute={isMute}
  switchCamera={switchCamera}
  muteVideo={muteVideo}
/>

```

## Props

| Prop                | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| **`color`**         | Sets the background color of component                                   |
| **`userId`**        | Sets the user ID of current user                                         |
| **`roomId`**        | Sets the room ID that users desires to enter                             |
| **`authToken`**     | Required JWT token in order to join the room                             |
| **`style`**         | Style properties of outer component                                      |
| **`layout`**        | Object that takes width and height to set the component size.            |
| **`isMute`**        | Boolean value to switch current user's microphone (on/off)               |
| **`switchCamera`**  | Boolean value to switch current user's camera (front/back)               |
| **`muteVideo`**     | Boolean value to switch current user's Video streaming                   |

## License

MIT
