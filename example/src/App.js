import * as React from 'react';

import AppContainer from './navigator/AppContainer';
import { setNavigator } from './services/navigation';

export default function App() {
  return <AppContainer ref={(nav) => setNavigator(nav)} />;
}
