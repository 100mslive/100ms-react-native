import * as React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './redux/index';
import AppContainer from './navigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppContainer />
      </Provider>
    </GestureHandlerRootView>
  );
}
