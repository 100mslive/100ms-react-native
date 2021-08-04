import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AppStack from './App';

const AppContainer = createAppContainer(
  createSwitchNavigator({
    App: AppStack,
  }),
  {
    navigationOptions: {
      gestureEnabled: false,
    },
    defaultNavigationOptions: {
      gestureEnabled: false,
    },
    initialRouteName: 'App',
  },
);

export default AppContainer;
