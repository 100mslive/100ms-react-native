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

Installation of dependencies
run following commands

```
npm i

cd ios/ && pod install
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
