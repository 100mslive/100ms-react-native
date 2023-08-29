import React, {useEffect} from 'react';
import {Platform, UIManager} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import {Welcome} from '../screens/Welcome';
import {QRCodeScanner} from '../screens/QRCodeScanner';
import {MeetingSetup} from '../screens/MeetingSetup';
import {Meeting} from '../screens/MeetingScreen';

const AppStack = createNativeStackNavigator();
const navigationOptions = {
  gestureEnabled: false,
  headerShown: false,
};

const AppStackNavigator = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  return (
    <NavigationContainer>
      <AppStack.Navigator initialRouteName="WelcomeScreen">
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
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppStackNavigator;
