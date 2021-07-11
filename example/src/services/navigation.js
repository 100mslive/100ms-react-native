import {
  NavigationActions,
  SwitchActions,
  StackActions,
} from 'react-navigation';

const config = {};

// navigate within the stack navigator.
export const navigate = (path) => {
  if (config.navigator) {
    config.navigator.dispatch(NavigationActions.navigate({ routeName: path }));
  }
};

// replace within the stack navigator.
export const replaceRoute = (path) => {
  if (config.navigator) {
    config.navigator.dispatch(StackActions.replace({ routeName: path }));
  }
};

// sets the navigator reference.
export const setNavigator = (nav) => {
  if (nav) {
    config.navigator = nav;
  }
};

// jump to a navigation stack.
export const jumpToSwitchNavigatorStack = (screen) => {
  if (config.navigator) {
    config.navigator.dispatch(SwitchActions.jumpTo({ routeName: screen }));
  }
};
