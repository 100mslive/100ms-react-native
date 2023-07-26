import React, { memo, useContext } from 'react';
import { Provider } from 'react-redux';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { store } from './redux/index';
import { HMSContainer } from './HMSContainer';
import { setPrebuiltData } from './redux/actions';
import type { IOSBuildConfig } from './utils/types';

export interface HMSPrebuiltProps {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    endPoints?: {
      init: string;
      token: string;
    };
    debugMode?: boolean;
    ios?: IOSBuildConfig;
  };
}

const _HMSPrebuilt: React.FC<HMSPrebuiltProps> = (props) => {
  const { roomCode, options } = props;

  const insetsContext = useContext(SafeAreaInsetsContext);

  store.dispatch(setPrebuiltData({ roomCode, options }));

  if (insetsContext) {
    return (
      <Provider store={store}>
        <HMSContainer />
      </Provider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <HMSContainer />
      </Provider>
    </SafeAreaProvider>
  );
};

// TODO: handle props change
export const HMSPrebuilt = memo(_HMSPrebuilt);
