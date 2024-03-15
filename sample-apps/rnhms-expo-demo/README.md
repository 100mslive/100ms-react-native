# Expo & Prebuilt Sample App

This Expo app uses `@100mslive/react-native-room-kit` package for adding video calling feature.

To add video calling feature into your own Expo app, You can refer [Expo & Prebuilt Quickstart guide](https://www.100ms.live/docs/react-native/v2/quickstart/expo-prebuilt)

You can also build this app locally on your machine -

1. Fork and clone the repo
2. Change your current working directory to `..../sample-apps/rnhms-expo-demo` dir.
3. Install `node_modules` by running `npx expo install`.
4. You Need to have `Node.js >= 18`, You can check your node version by running `node -v`. You can use [nvm](https://github.com/nvm-sh/nvm) or upgarde your node version.
5. Recreate `android` and `ios` folders by running `npx expo prebuild`.
6. Now you should be able to run apps by running `npm run android` or `npm run ios`.

## Android Setup

Android app is targeting `Android SDK 34`. Therefore, You will need `JDK 17` to build the Android app.

You can check your JDK version by running `java --version` in terminal.
