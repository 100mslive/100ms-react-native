import React, {useState, useCallback} from 'react';
import {
  StatusBar,
  StyleSheet,
  Button,
  View,
  Alert,
  Platform,
} from 'react-native';
import {HMSPrebuilt} from '@100mslive/react-native-room-kit';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

const App = () => {
  const [showHMSPrebuilt, setShowHMSPrebuilt] = useState(false);

  const start = () => {
    if (Platform.OS === 'ios') {
      setShowHMSPrebuilt(true);
      return;
    }

    requestMultiple([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ])
      .then(data => {
        const cameraPermissionStatus = data[PERMISSIONS.ANDROID.CAMERA];
        const audioPermissionStatus = data[PERMISSIONS.ANDROID.RECORD_AUDIO];
        if (
          cameraPermissionStatus === 'granted' &&
          audioPermissionStatus === 'granted'
        ) {
          setShowHMSPrebuilt(true);
        } else {
          Alert.alert(
            'Permission Not Granted',
            'Camera and Audio permissions are required!',
          );
        }
      })
      .catch(error => {
        Alert.alert('Error', error.description);
      });
  };

  const handleRoomLeave = useCallback((reason: any) => {
    console.log(':: Reason for Leaving the Room > ', reason);
    setShowHMSPrebuilt(false);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle={'dark-content'} />

          {showHMSPrebuilt ? (
            <HMSPrebuilt
              roomCode={'rlk-lsml-aiy'}
              options={{userName: 'John Appleseed'}}
              onLeave={handleRoomLeave}
            />
          ) : (
            <View style={styles.joinContainer}>
              <Button title="Start" onPress={start} />
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
