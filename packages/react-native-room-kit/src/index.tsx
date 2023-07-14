import React, { memo } from 'react';
import { Provider } from 'react-redux';

import { store } from './redux/index';
import { HMSContainer } from './HMSContainer';
import { setPrebuiltData } from './redux/actions';

export interface HMSRoomCompositeProps {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    endPoints?: {
      init: string;
      token: string;
    };
    debugMode?: boolean;
  };
}

export const _HMSRoomComposite: React.FC<HMSRoomCompositeProps> = (props) => {
  const { roomCode, options } = props;

  store.dispatch(setPrebuiltData({ roomCode, options }));

  return (
    <Provider store={store}>
      <HMSContainer />
    </Provider>
  );
};

// TODO: handle props change
export const HMSRoomComposite = memo(_HMSRoomComposite);
