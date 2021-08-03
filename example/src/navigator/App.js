import {createStackNavigator} from 'react-navigation-stack';
import AppWelcomeScreen from '../screens/Home';
import WelcomeScreen from '../screens/WelcomeScreen';
import Meeting from '../screens/Meeting';

const AppStack = createStackNavigator(
  {AppWelcomeScreen, WelcomeScreen, Meeting},
  {
    navigationOptions: {
      gestureEnabled: false,
    },
    defaultNavigationOptions: {
      gestureEnabled: false,
    },
    initialRouteName: 'WelcomeScreen',
    headerMode: 'none',
  },
);

export default AppStack;
