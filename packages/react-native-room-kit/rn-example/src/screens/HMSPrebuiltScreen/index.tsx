import React from 'react';
import {Text} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {HMSRoomComposite} from '@100mslive/react-native-room-kit';

import {AppStackParamList} from '../../navigator';

export const HMSPrebuiltScreen = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>();

  const roomCode = route.params?.roomCode;

  if (!roomCode) {
    return <Text>Room Code is Required</Text>;
  }

  return <HMSRoomComposite roomCode={roomCode} options={route.params} />;
};
