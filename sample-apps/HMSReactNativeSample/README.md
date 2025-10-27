# 100ms React Native Sample App

A React Native app which has the fully featured 100ms app UI along with the Core SDK.

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

## Setup

Ensure you are using **Java 17** to build the android app.
You can check your JDK version as mentioned below:

1. If you are building the app using CLI, run `java --version` in terminal.
2. If you are building the app using Android Studio:
   - Open Android Studio > Settings > Build, Execution, Deployment > Build Tools > Gradle
   - Search for "Gradle JDK" field, "JDK 17" should be selected as value

## Build Instructions

1. Clone the repository
2. Ensure Node.js version 22 is installed (`node --version`)
3. Run `npm install` in the project root
4. For Android: Run `npx react-native run-android`
5. For iOS:
   - Navigate to `ios` folder and run `pod install`
   - Run `npx react-native run-ios`

The Google Drive Link below contains all files including node_modules, Git ignored files, etc:

- https://drive.google.com/file/d/1XtpBZmTT20pJz3-2KnCbieFHetqnmpCa/
