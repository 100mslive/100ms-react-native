import React, {useEffect} from 'react';
import {Platform, UIManager} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {Welcome} from '../screens/Welcome';
import {Meeting} from '../screens/MeetingScreen/index';
// import {Meeting} from '../screens/Meeting';
import {QRCode} from '../screens/QRCode';
import {QRCodeScanner} from '../screens/QRCodeScanner';

export type AppStackParamList = {
  WelcomeScreen: undefined;
  MeetingScreen: undefined;
  QRCodeScreen: undefined;
  QRCodeScannerScreen: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
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
      <AppStack.Navigator initialRouteName="QRCodeScreen">
        <AppStack.Screen
          name="WelcomeScreen"
          component={Welcome}
          options={navigationOptions}
        />
        <AppStack.Screen
          name="MeetingScreen"
          component={Meeting}
          options={navigationOptions}
        />
        <AppStack.Screen
          name="QRCodeScreen"
          component={QRCode}
          options={navigationOptions}
        />
        <AppStack.Screen
          name="QRCodeScannerScreen"
          component={QRCodeScanner}
          options={navigationOptions}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppStackNavigator;
