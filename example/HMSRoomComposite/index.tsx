import React from 'react';
import {View, Text} from 'react-native';

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'pink',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>HMS Room Composite</Text>

      <Text>Room Code: {roomCode}</Text>

      {options ? (
        <View style={{marginTop: 8}}>
          <Text>Username: {options.userName}</Text>
          <Text>UserId: {options.userId}</Text>
          <Text>Token EndPoint: {options.endPoints?.token}</Text>
          <Text>Init EndPoint: {options.endPoints?.init}</Text>
          <Text>Debug Info: {debugInfo.toString()}</Text>
        </View>
      ) : null}
    </View>
  );
};
