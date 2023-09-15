import React, { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { QRCode } from '../screens/QRCode';
import { QRCodeScanner } from '../screens/QRCodeScanner';
import { HMSPrebuiltScreen } from '../screens/HMSPrebuiltScreen';

export type AppStackParamList = {
  QRCodeScreen: undefined;
  QRCodeScannerScreen: undefined;
  HMSPrebuiltScreen: {
    roomCode: string;
    userName?: string;
    userId?: string;
    debugMode?: boolean;
    initEndPoint?: string;
    tokenEndPoint?: string;
    layoutEndPoint?: string;
  };
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
const navigationOptions = {
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
          name="QRCodeScreen"
          component={QRCode}
          options={navigationOptions}
        />
        <AppStack.Screen
          name="QRCodeScannerScreen"
          component={QRCodeScanner}
          options={navigationOptions}
        />
        <AppStack.Screen
          name="HMSPrebuiltScreen"
          component={HMSPrebuiltScreen}
          options={navigationOptions}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default AppStackNavigator;
