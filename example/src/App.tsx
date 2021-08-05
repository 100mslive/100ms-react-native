import * as React from 'react';
import {Provider} from 'react-redux';
import {store} from './redux/index';

import AppContainer from './navigator/AppContainer';
import {setNavigator} from './services/navigation';

export default function App() {
  return (
    <Provider store={store}>
      <AppContainer ref={(nav: any) => setNavigator(nav)} />
    </Provider>
  );
}
