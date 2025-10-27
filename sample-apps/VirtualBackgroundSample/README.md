# 100ms Virtual Background Sample App

This is a React Native sample app demonstrating the Virtual Background feature with the 100ms React Native SDK.

## Requirements

### Minimum Configuration

- React Native 0.73.0 or above
- Java 17 or above
- Android API level 24 or above
- Xcode 14 or above
- iOS 16 or above
- Node.js 22 or above

### Recommended Configuration

- React Native 0.77.3 or above
- Java 17 or above
- Android API level 35 or above
- Xcode 15 or above
- iOS 16 or above
- Node.js 22 or above

## Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

### Step 1: Install Dependencies

First, install the project dependencies:

```bash
npm install
```

### Step 2: Start the Metro Server

Start Metro, the JavaScript bundler that ships with React Native:

```bash
npm start
```

### Step 3: Start your Application

Let Metro Bundler run in its own terminal. Open a new terminal from the root of your React Native project and run the following command to start your Android or iOS app:

#### For Android

```bash
npm run android
```

#### For iOS

First, install the iOS dependencies:

```bash
cd ios
pod install
cd ..
```

Then run the app:

```bash
npm run ios
```

If everything is set up correctly, you should see your new app running in your Android Emulator or iOS Simulator shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Features

This sample app demonstrates:

- Virtual background effects with 100ms React Native SDK
- Background blur effects
- Custom background images
- Real-time video processing

## Learn More

To learn more about 100ms React Native SDK and Virtual Background feature, take a look at the following resources:

- [100ms React Native SDK Documentation](https://www.100ms.live/docs/react-native/v2/foundation/basics)
- [Virtual Background Guide](https://www.100ms.live/docs/react-native/v2/how-to-guides/extend-capabilities/plugins/virtual-background)
- [100ms Dashboard](https://dashboard.100ms.live/)

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page or visit the [100ms Discord Community](https://100ms.live/discord).
