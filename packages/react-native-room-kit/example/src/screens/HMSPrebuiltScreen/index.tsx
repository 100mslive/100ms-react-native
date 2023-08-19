import React, { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { HMSPrebuilt } from '@100mslive/react-native-room-kit';
import type { HMSPrebuiltProps } from '@100mslive/react-native-room-kit';

import { AppStackParamList } from '../../navigator';

export const HMSPrebuiltScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const screenParams =
    useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>().params;

  // function to be called when meeting is ended
  const handleMeetingLeave = useCallback(() => {
    navigation.navigate('QRCodeScreen');
  }, []);

  // room code of the HMSRoom
  const roomCode = screenParams?.roomCode;

  // HMSPrebuilt component options
  const prebuiltOptions: HMSPrebuiltProps['options'] = useMemo(
    () => ({
      userName: screenParams?.userName,
      userId: screenParams?.userId,
      debugMode: screenParams?.debugMode,
      endPoints:
        screenParams?.tokenEndPoint && screenParams?.initEndPoint
          ? {
              token: screenParams?.tokenEndPoint,
              init: screenParams?.initEndPoint,
            }
          : undefined,
      ios: {
        appGroup: 'group.rnroomkit',
        preferredExtension: 'live.100ms.reactnative.RNExampleBroadcastUpload',
      },
    }),
    [screenParams]
  );

  // Room Code is required to join the room
  if (!roomCode) {
    return <Text>Room Code is Required</Text>;
  }

  return (
    <HMSPrebuilt
      roomCode={roomCode}
      options={prebuiltOptions}
      onLeave={handleMeetingLeave}
    />
  );
};
