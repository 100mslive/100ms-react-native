<a href="https://100ms.live/">
<img src="https://raw.githubusercontent.com/100mslive/react-native-hms/main/100ms.svg" title="100ms logo" float=center height=256>
</a>

[![HMSLive Room Kit](https://img.shields.io/npm/v/@100mslive/react-native-room-kit)](https://www.npmjs.com/package/@100mslive/react-native-room-kit)
[![Build](https://github.com/100mslive/100ms-react-native/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/100mslive/100ms-react-native/actions/workflows/build.yml)
[![license](https://img.shields.io/npm/l/@100mslive/react-native-hms)](https://www.100ms.live/)
[![quality](https://img.shields.io/npms-io/quality-score/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![collaborators](https://img.shields.io/npm/collaborators/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)
[![Documentation](https://img.shields.io/badge/Read-Documentation-blue)](https://docs.100ms.live/react-native/v2/foundation/basics)
[![Discord](https://img.shields.io/discord/843749923060711464?label=Join%20on%20Discord)](https://100ms.live/discord)
[![Firebase](https://img.shields.io/badge/Download%20Android-Firebase-green)](https://appdistribution.firebase.dev/i/7b7ab3b30e627c35)
[![TestFlight](https://img.shields.io/badge/Download%20iOS-TestFlight-blue)](https://testflight.apple.com/join/v4bSIPad)
[![Activity](https://img.shields.io/github/commit-activity/m/100mslive/react-native-hms.svg)](https://github.com/100mslive/react-native-hms/projects/1)
[![Register](https://img.shields.io/badge/Contact-Know%20More-blue)](https://dashboard.100ms.live/register)

# 100ms React Native Room Kit

Integrate Real Time Audio and Video conferencing, Interactive Live Streaming, and Chat in your apps with 100ms React Native SDK.

With support for HLS and RTMP Live Streaming and Recording, Picture-in-Picture (PiP), one-to-one Video Call Modes, Audio Rooms, Video Player and much more, add immersive real-time communications to your apps.

📖 Read the Complete Documentation here: https://www.100ms.live/docs/react-native/v2/foundation/basics

| Package                              | Version                                                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| @100mslive/react-native-room-kit     | [![npm](https://img.shields.io/npm/v/@100mslive/react-native-room-kit)](https://www.npmjs.com/package/@100mslive/react-native-room-kit)         |
| @100mslive/react-native-hms          | [![npm](https://img.shields.io/npm/v/@100mslive/react-native-hms)](https://www.npmjs.com/package/@100mslive/react-native-hms)                   |
| @100mslive/react-native-video-plugin | [![npm](https://img.shields.io/npm/v/@100mslive/react-native-video-plugin)](https://www.npmjs.com/package/@100mslive/react-native-video-plugin) |

## 🏃 Example App

📲 Download the Example iOS app here: https://testflight.apple.com/join/v4bSIPad

🤖 Download the Example Android app here: https://appdistribution.firebase.dev/i/7b7ab3b30e627c35

To get a better understanding of how the example app is structured, what to do on `onJoin`, `onTrack` and `onPeer` listeners, creating `PeerTrackNodes`, how to use Redux, and what type of layouts and sorting you can implement in your app, checkout [Example App's README](https://github.com/100mslive/react-native-hms/blob/develop/example/README.md)

## ☝️ Minimum Configuration

- Support for React Native 0.64.4 or above
- Support for Java 8 or above
- Support for Android API level 24 or above
- Xcode 13 or above
- Support for iOS 12 or above

## 🤝 Recommended Configuration

- React Native 0.69.0 or above
- Java 11 or above
- Android API level 33 or above
- Xcode 14 or above
- iOS 16 or above

## 📱 Supported Devices

- The Android SDK supports Android API level 21 and higher. It is built for armeabi-v7a, arm64-v8a, x86, and x86_64 architectures.
  Devices running Android OS 11 or above is recommended.

- iPhone & iPads with iOS version 12 or above are supported.
  Devices running iOS 16 or above is recommended.

## Installation

```bash
npm install @100mslive/react-native-room-kit --save
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
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

You will also need to request Camera and Record Audio permissions at runtime before you join a call or display a preview. Please follow [Android Documentation](https://developer.android.com/training/permissions/requesting#request-permission) for runtime permissions.

We suggest using [react-native-permission](https://www.npmjs.com/package/react-native-permissions) to acquire permissions from both platforms.

More information about Audio Video Permission on iOS & Android is [available here](https://www.100ms.live/docs/react-native/v2/features/integration#permissions).

## Overview

This guide will walk you through simple instructions to create a Video Conferencing app using the 100ms Prebuilt and test it using an Emulator or your Mobile Phone.

## Create a sample app

This section contains instructions to create a simple React Native Video Conferencing app. We will help you with instructions to understand the project setup and complete code sample to implement this quickly.

<div className="steps-container">

### Prerequisites

- A [100ms account](https://dashboard.100ms.live/register) if you don't have one already.
- Working [React Native Development Environment](https://reactnative.dev/docs/environment-setup) for React Native CLI
- Familiar with basics of [React Native](https://reactnative.dev/docs/getting-started).
- [VS code](https://code.visualstudio.com/) or any other IDE / code editor

### Create a React Native app

Once you have the prerequisites, follow the steps below to create a React Native app. This guide will use [VS code](https://code.visualstudio.com/) but you can use any code editor or IDE.

1. Open your Terminal and navigate to directory/folder where you would like to create your app.

2. Run the below command to create React Native app:
   ​

```bash section=CreateRnApp
npx react-native init PrebuiltSampleApp --version 0.68.5 --npm && cd ./PrebuiltSampleApp
```

3. Once the app is created, open it in VS code.

4. Test run your app

   a. Build the App
   ​

   #### For Android

   ```bash section=BuildApp sectionIndex=1 tab=Android
   npx react-native run-android
   ```

   #### For iOS

   ```bash
   npx react-native run-ios --simulator="iPhone 14"
   ```

   b. Start Metro Bundler if it is not already started
   ​

   ```bash
   npx react-native start
   ```

   or follow instructions printed in Terminal to start the Metro Bundler or Run the Application.

### Install the Dependencies

After the Test run of your app is successful, you can install [100ms React Native Room Kit package](https://www.npmjs.com/package/@100mslive/react-native-room-kit) in your app.

```bash
npm install --save @100mslive/react-native-room-kit
```

#### Install the Peer Dependencies

1. react-native-permissions package
   Since the app and `@100mslive/react-native-room-kit` package requires Camera & Microphone permissions, a package for requesting these permissions from users should also be installed. We recommend using the
   [react-native-permissions](https://www.npmjs.com/package/react-native-permissions) package.

```bash
npm install react-native-permissions@3.4.0
```

Native File Changes for `react-native-permissions` package -

#### For Android

1. Allow camera, recording audio and internet permissions by adding the below snippet to the `AndroidManifest.xml` file (at the application tag level).

```xml section=androidPermissions
<uses-feature android:name="android.hardware.camera"/>
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
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

2. Change `minSdkVersion` to 24 in the `android/build.gradle` file

```json{4}
buildscript {
  ext {
    ...
    minSdkVersion = 24
    ...
  }
}
```

#### For iOS

1. Allow camera, recording audio and internet permissions

Add the below snippet in the `info.plist` file -

```xml section=ForIOSPermissions sectionIndex=1
<key>NSCameraUsageDescription</key>
<string>Please allow access to Camera to enable video conferencing</string>

<key>NSMicrophoneUsageDescription</key>
<string>Please allow access to Microphone to enable video conferencing</string>

<key>NSLocalNetworkUsageDescription</key>
<string>Please allow access to network usage to enable video conferencing</string>
```

2. Add the below snippet in the `ios/Podfile` file -

```json{3-6}
target 'PrebuiltSampleApp' do
...
  permissions_path = '../node_modules/react-native-permissions/ios'

  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"
...
end
```

If you see any permission related error, then check out `react-native-permissions` library [setup guide](https://github.com/zoontek/react-native-permissions/tree/3.4.0#setup) for `v3.4.0`.

> Note: If you have already setup the `react-native-permissions` package, then you can continue with your existing setup.

> Note: iOS simulator and android emulator doesn't support actual video, you need actual devices to see your video in real-time.

2. react-native-reanimated package
   `react-native-reanimated` package is required for adding animated views.

```bash
npm install react-native-reanimated@2.17.0
```

Follow [official installation steps](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/installation) for `v2.17.0`.

> Note: If you already have the setup for `react-native-reanimated` package, then you can continue with your existing setup. We recommend using `>= 2.x.x` versions.

#### Install the dependencies of react-native-room-kit package

`react-native-room-kit` package depends upon many other packages. These packages to be your app's direct dependencies so that `react-native` can link them.

```bash
npm install @100mslive/react-native-hms
  @shopify/flash-list@1.4.3
  react-native-keyboard-controller@^1.6.1
  react-native-linear-gradient@2.7.3
  react-native-modal@12.1.0
  react-native-safe-area-context@3.3.0
  react-native-simple-toast@1.1.3
```

1. Native File Changes for `@100mslive/react-native-hms` package

#### For iOS

Change ios target platform version to '13.0' in the `ios/Podfile` file

```json{4}
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'
install! 'cocoapods', :deterministic_uuids => false
```

Follow official installation steps of these libraries if you encounter any problem in setup.

> Note: If you already have the setup for any of the listed package, then you may continue with your existing setup. If some problem occurs then try using specified version for the package.

#### Configure Inter Font Family

`react-native-room-kit` package uses 'Inter' font family for texts. You need to add 'Inter' fonts in your app.

#### Enable Background modes for iOS

You can enable background modes for audio in iOS. so that when you minimze the app, room audio can still be heared by the users.

Paste the following in your `Info.plist` file -

```xml{3-6}
<dict>
  ...
	<key>UIBackgroundModes</key>
	<array>
		<string>audio</string>
	</array>
  ...
</dict>
```

#### Additional Setup

You can follow [ScreenShare setup](https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/screenshare) and [AudioShare setup](https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share) guides to add ScreenShare and Audio Share features in your app.

After doing changes related to ScreenShare feature, To use screenshare feature on iOS, pass `appGroup` and `preferredExtension` options to `HMSPrebuilt` componnets -

```js{6-7}
<HMSPrebuilt
  roomCode="..."
  options={{
    ...
    ios: {
      appGroup: "...";
      preferredExtension: "...";
    }
  }}
/>
```

### Complete code example

Now that your project setup is complete, let's replace the code in the `App.js` file with the complete code sample below -

```js section=completeCodeExample
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Button, View } from 'react-native';
import { HMSPrebuilt } from '@100mslive/react-native-room-kit';

const App = () => {
  const [showHMSPrebuilt, setShowHMSPrebuilt] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} />

      {showHMSPrebuilt ? (
        <HMSPrebuilt
          roomCode="mki-scw-wnw"
          options={{ userName: 'John Appleseed' }}
        />
      ) : (
        <View style={styles.joinContainer}>
          <Button title="Start" onPress={() => setShowHMSPrebuilt(true)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  joinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
```

### Test the app

Follow the instructions in one of the tabs below based on the target platform you wish to test the app.

a. Build the App

#### For Android

```bash section=BuildApp sectionIndex=1 tab=Android
npx react-native run-android
```

#### For iOS

```bash section=BuildApp sectionIndex=1 tab=iOS
npx react-native run-ios --simulator="iPhone 14"
```

b. Start Metro Bundler if it is not already started

```bash section=BuildApp sectionIndex=2
npx react-native start
```

Follow the instructions printed in the Terminal to start the Metro Bundler or Run the Application.

### Check Deployed Sample Apps

You can download and check out the 100ms React Native deployed apps -

🤖 Download the Sample Android App [here](https://appdistribution.firebase.dev/i/7b7ab3b30e627c35)

📲 Download the Sample iOS App [here](https://testflight.apple.com/join/v4bSIPad)
