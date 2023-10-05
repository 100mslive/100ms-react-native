import React, { memo } from 'react';
import { Provider } from 'react-redux';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { store } from './redux/index';
import { HMSContainer } from './HMSContainer';
import { setPrebuiltData } from './redux/actions';
import type { HMSIOSScreenShareConfig } from './utils/types';

export interface HMSPrebuiltProps {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    endPoints?: {
      init: string;
      token: string;
      layout: string;
    };
    debugMode?: boolean;
    ios?: HMSIOSScreenShareConfig;
  };
  onLeave?: () => void;
}

const _HMSPrebuilt: React.FC<HMSPrebuiltProps> = (props) => {
  const { roomCode, options, onLeave } = props;

  store.dispatch(setPrebuiltData({ roomCode, options, onLeave }));

  // @ts-ignore Not using `useContext` hook because we don't want to subscribe to updates
  // We just want to check if SafeAreaProvider exists or not
  const safeAreaProviderExists = !!SafeAreaInsetsContext.Consumer._currentValue;

  const content = (
    <Provider store={store}>
      <HMSContainer />
    </Provider>
  );

  if (safeAreaProviderExists) {
    return content;
  }

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
};

// TODO: handle props change
export const HMSPrebuilt = memo(_HMSPrebuilt);
