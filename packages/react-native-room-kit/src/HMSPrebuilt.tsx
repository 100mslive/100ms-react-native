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
    };
    debugMode?: boolean;
    ios?: HMSIOSScreenShareConfig;
  };
  onMeetingLeave?: () => void;
}

const _HMSPrebuilt: React.FC<HMSPrebuiltProps> = (props) => {
  const { roomCode, options, onMeetingLeave } = props;

  store.dispatch(setPrebuiltData({ roomCode, options, onMeetingLeave }));

  // @ts-ignore Not using `useContext` hook because we don't want to subscribe to updates
  // We just want to check if SafeAreaProvider exists or not
  const safeAreaProviderExists = !!SafeAreaInsetsContext.Consumer._currentValue;

  if (safeAreaProviderExists) {
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
