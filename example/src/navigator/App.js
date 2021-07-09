import {
  createStackNavigator,
  TransitionPresets,
} from 'react-navigation-stack';
import AppWelcomeScreen from '../screens/home';
import POCWelcomeScreen from '../screens/POCWelcomeScreen';

const followUpSurveyStack = createStackNavigator(
  AppWelcomeScreen,
  POCWelcomeScreen,
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

export default followUpSurveyStack;
