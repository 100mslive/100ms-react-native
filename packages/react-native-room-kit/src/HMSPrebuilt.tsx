import React, { memo } from 'react';
import { Provider } from 'react-redux';

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

export const _HMSPrebuilt: React.FC<HMSPrebuiltProps> = (props) => {
  const { roomCode, options } = props;

  store.dispatch(setPrebuiltData({ roomCode, options }));

  return (
    <Provider store={store}>
      <HMSContainer />
    </Provider>
  );
};

// TODO: handle props change
export const HMSPrebuilt = memo(_HMSPrebuilt);
