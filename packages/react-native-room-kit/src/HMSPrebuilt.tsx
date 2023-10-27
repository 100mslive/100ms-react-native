import React, { memo } from 'react';
import { Provider } from 'react-redux';
import { Platform } from 'react-native';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { store } from './redux/index';
import { HMSContainer } from './HMSContainer';
import { useSavePropsToStore } from './hooks-util';
import type { HMSPrebuiltProps } from './types';

const _HMSPrebuilt: React.FC<HMSPrebuiltProps> = (props) => {
  useSavePropsToStore(props, store.dispatch);

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

const arePropsEqual = (
  prevProps: Readonly<HMSPrebuiltProps>,
  nextProps: Readonly<HMSPrebuiltProps>
): boolean => {
  if (
    Platform.OS === 'android' &&
    !Object.is(prevProps.handleBackButton, nextProps.handleBackButton)
  ) {
    return false;
  }

  if (
    Platform.OS === 'android' &&
    !Object.is(prevProps.autoEnterPipMode, nextProps.autoEnterPipMode)
  ) {
    return false;
  }

  if (!Object.is(prevProps.onLeave, nextProps.onLeave)) {
    return false;
  }

  return true;
};

export const HMSPrebuilt = memo(_HMSPrebuilt, arePropsEqual);

export { type HMSPrebuiltProps };
