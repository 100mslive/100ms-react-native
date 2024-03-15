import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, View } from "react-native";
import { HMSPrebuilt } from "@100mslive/react-native-room-kit";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import {
  requestCameraPermissionsAsync,
  requestMicrophonePermissionsAsync,
} from "expo-camera";

const ROOM_CODE = "edr-ftkl-dsc";
const APP_GROUP = "group.com.hms.rnhmsexpodemo";
const PREFERRED_EXTENSION =
  "com.hms.rnhmsexpodemo.RNHMSExpoDemoBroadcastUpload";

const App = () => {
  // LOAD REQUIRED FONTS
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
  });

  const [showHMSPrebuilt, setShowHMSPrebuilt] = useState(false);

  // Asking Camera & Microphone permissions from user
  useEffect(() => {
    Promise.allSettled([
      requestCameraPermissionsAsync(),
      requestMicrophonePermissionsAsync(),
    ])
      .then((results) => {
        console.log("Permissions Result: ", results);
      })
      .catch((error) => {
        console.log("Permissions Error: ", error);
      });
  }, []);

  // If fonts are not loaded then show nothing
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // If an error occurred while loading fonts, show it
  if (!!fontError) {
    return (
      <Text>
        {fontError.message}: {fontError.message}
      </Text>
    );
  }

  // Content
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle={"dark-content"} />

        {showHMSPrebuilt ? (
          <HMSPrebuilt
            roomCode={ROOM_CODE}
            options={{
              userName: "John Appleseed",
              ios: {
                appGroup: APP_GROUP,
                preferredExtension: PREFERRED_EXTENSION,
              },
            }}
            onLeave={() => setShowHMSPrebuilt(false)}
          />
        ) : (
          <View style={styles.joinContainer}>
            <Button title="Start" onPress={() => setShowHMSPrebuilt(true)} />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  joinContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
