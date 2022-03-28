import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import WelcomeScreen from '../screens/WelcomeScreen';
import MeetingScreen from '../screens/MeetingScreen';

export type AppStackParamList = {
  WelcomeScreen: undefined;
  MeetingScreen: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
const navigationOptions = {
  gestureEnabled: false,
  headerShown: false,
};

const AppStackNavigator = () => (
  <NavigationContainer>
    <AppStack.Navigator initialRouteName="WelcomeScreen">
      <AppStack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={navigationOptions}
      />
      <AppStack.Screen
        name="MeetingScreen"
        component={MeetingScreen}
        options={navigationOptions}
      />
    </AppStack.Navigator>
  </NavigationContainer>
);

export default AppStackNavigator;
