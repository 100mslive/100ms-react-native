import React, {useEffect, useRef, useState} from 'react';
import {Platform, UIManager} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Welcome} from '../screens/Welcome';
import {QRCodeScanner} from '../screens/QRCodeScanner';
import {MeetingSetup} from '../screens/MeetingSetup';
import {Meeting} from '../screens/MeetingScreen';
import {FCMSetup} from '../components/FCMSetup';
import {getRandomUserId} from '../utils/functions';

const AppStack = createNativeStackNavigator();
const navigationOptions = {
  gestureEnabled: false,
  headerShown: false,
};

const AppStackNavigator = () => {
  const initialDataRef = useRef(null);
  const [fetchingInitialData, setFetchingInitialData] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      // Getting data saved when User pressed Answer call button in Incoming call UI
      const data = await AsyncStorage.getItem('answerCall_data');

      // Clearing it, so that it is not persisted
      AsyncStorage.removeItem('answerCall_data');

      // If not data available, do nothing, proceed with regular App flow
      if (!data) {
        setFetchingInitialData(false);
        return null;
      }

      try {
        const parsedData = JSON.parse(data);
        const roomCode = parsedData.callUUID; // we saved roomCode value in `callUUID` key

        initialDataRef.current = {
          ...parsedData,
          roomCode,
          userId: getRandomUserId(6),
        };
      } catch (error) {
        // Handle value parse error
      }
      setFetchingInitialData(false);
    }

    fetchInitialData();

    // Remove any pending `AsyncStorage` calls
    return () => AsyncStorage.flushGetRequests();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  if (fetchingInitialData) {
    return null;
  }

  // Display "Meeting" screen if we have initial Room Code data from Incoming call
  const initialScreen = initialDataRef.current?.roomCode
    ? 'MeetingScreen'
    : 'WelcomeScreen';

  return (
    <NavigationContainer>
      <FCMSetup>
        <AppStack.Navigator initialRouteName={initialScreen}>
          <AppStack.Screen
            name="WelcomeScreen"
            component={Welcome}
            options={navigationOptions}
          />
          <AppStack.Screen
            name="QRCodeScannerScreen"
            component={QRCodeScanner}
            options={navigationOptions}
          />
          <AppStack.Screen
            name="MeetingSetupScreen"
            component={MeetingSetup}
            options={navigationOptions}
          />
          <AppStack.Screen
            name="MeetingScreen"
            component={Meeting}
            options={navigationOptions}
            initialParams={initialDataRef.current}
          />
        </AppStack.Navigator>
      </FCMSetup>
    </NavigationContainer>
  );
};

export default AppStackNavigator;
