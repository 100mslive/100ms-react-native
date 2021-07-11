import { createStackNavigator } from 'react-navigation-stack';
import AppWelcomeScreen from '../screens/Home';
import POCWelcomeScreen from '../screens/POCWelcomeScreen';

const AppStack = createStackNavigator(
  { AppWelcomeScreen, POCWelcomeScreen },
  {
    navigationOptions: {
      gestureEnabled: false,
    },
    defaultNavigationOptions: {
      gestureEnabled: false,
    },
    initialRouteName: 'POCWelcomeScreen',
    headerMode: 'none',
  }
);

export default AppStack;
