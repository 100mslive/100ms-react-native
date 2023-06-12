import React from 'react';
import {View, Text} from 'react-native';
import {Provider} from 'react-redux';

import {store} from './redux/index';
import {Meeting} from './components/Meeting';
import {HMSRoomSetup} from './HMSRoomSetup';

export interface HMSRoomCompositeProps {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    endPoints?: {
      init: string;
      token: string;
    };
    debugInfo?: boolean;
  };
}

export const HMSRoomComposite: React.FC<HMSRoomCompositeProps> = props => {
  const {roomCode, options} = props;

  const debugInfo = options?.debugInfo || false;

  // Username: options.userName
  // UserId: options.userId
  // Token EndPoint: options.endPoints?.token
  // Init EndPoint: options.endPoints?.init

  return (
    <Provider store={store}>
      <HMSRoomSetup />
    </Provider>
  );
};
