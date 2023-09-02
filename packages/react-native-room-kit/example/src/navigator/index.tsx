import React, { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { HomeScreen } from '../screens/HomeScreen';
import { QRCodeScanner } from '../screens/QRCodeScanner';
import { HMSPrebuiltScreen } from '../screens/HMSPrebuiltScreen';

export type AppStackParamList = {
  HomeScreen: undefined;
  QRCodeScannerScreen: undefined;
  HMSPrebuiltScreen: {
    roomCode: string;
    userName?: string;
    userId?: string;
    debugMode?: boolean;
    initEndPoint?: string;
    tokenEndPoint?: string;
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
      <AppStack.Navigator initialRouteName={'HomeScreen'}>
        <AppStack.Screen
          name="HomeScreen"
          component={HomeScreen}
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
