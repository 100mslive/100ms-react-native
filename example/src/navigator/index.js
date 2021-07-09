import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import App from './App';

export const AppContainer = createAppContainer(
  createSwitchNavigator({
    App,
  }),
  {
    navigationOptions: {
      gestureEnabled: false,
    },
    defaultNavigationOptions: {
      gestureEnabled: false,
    },
    initialRouteName: 'App',
  }
);
