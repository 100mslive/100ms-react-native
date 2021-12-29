import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import WelcomeScreen from '../screens/WelcomeScreen';
import Meeting from '../screens/Meeting';

export type AppStackParamList = {
  AppWelcomeScreen: undefined;
  WelcomeScreen: undefined;
  Meeting: undefined;
};

const AppStack = createStackNavigator<AppStackParamList>();
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
        name="Meeting"
        component={Meeting}
        options={navigationOptions}
      />
    </AppStack.Navigator>
  </NavigationContainer>
);

export default AppStackNavigator;
