import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {Welcome} from '../screens/Welcome';
import {Meeting} from '../screens/Meeting';
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

const AppStackNavigator = () => (
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

export default AppStackNavigator;
