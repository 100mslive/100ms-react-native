# Expo & Prebuilt Sample App

This Expo app uses `@100mslive/react-native-room-kit` package for adding video calling feature.

To add video calling feature into your own Expo app, You can refer [Expo & Prebuilt Quickstart guide](https://www.100ms.live/docs/react-native/v2/quickstart/expo-prebuilt)

## Requirements

### Minimum Configuration

- React Native 0.73.0 or above
- Java 17 or above
- Android API level 24 or above
- Xcode 14 or above
- iOS 16 or above
- Node.js 22 or above
- Expo SDK 50 or above

### Recommended Configuration

- React Native 0.77.3 or above
- Java 17 or above
- Android API level 35 or above
- Xcode 15 or above
- iOS 16 or above
- Node.js 22 or above

## Build Locally

You can also build this app locally on your machine:

1. Fork and clone the repo
2. Change your current working directory to `..../sample-apps/rnhms-expo-demo` dir.
3. Install `node_modules` by running `npx expo install`.
4. You need to have `Node.js >= 22`. You can check your node version by running `node -v`. You can use [nvm](https://github.com/nvm-sh/nvm) or upgrade your node version.
5. Recreate `android` and `ios` folders by running `npx expo prebuild`.
6. Now you should be able to run apps by running `npm run android` or `npm run ios`.

## Android Setup

Android app is targeting `Android SDK 34`. Therefore, You will need **Java 17** to build the Android app.

You can check your JDK version by running `java --version` in terminal.
