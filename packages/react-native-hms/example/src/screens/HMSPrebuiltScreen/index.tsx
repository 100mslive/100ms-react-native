import React from 'react';
import {Text} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {AppStackParamList} from '../../navigator';
import {HMSRoomComposite} from '../../../HMSRoomComposite';

export const HMSPrebuiltScreen = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>();

  const roomCode = route.params?.roomCode;

  if (!roomCode) {
    return <Text>Room Code is Required</Text>;
  }

  return <HMSRoomComposite roomCode={roomCode} options={route.params} />;
};
