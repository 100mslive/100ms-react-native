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

import  VIForegroundService from '@voximplant/react-native-foreground-service';


export const HMSPrebuiltScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const screenParams =
    useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>().params;

  // function to be called when meeting is ended
  const handleMeetingLeave = useCallback(() => {
    VIForegroundService.getInstance().stopService().then((result: any) => {
      console.log('Stopped Android Foreground service: ', result);
      navigation.navigate('QRCodeScreen');
    });
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

  const androidForegroundServiceChannelConfig = {
    id: 'MyAppChannelID',
    name: 'My App Channel name',
    enableVibration: true,
    importance: 5,
  };
  VIForegroundService.getInstance().createNotificationChannel(
    androidForegroundServiceChannelConfig
  ).then((r: any) => console.log('Created Android Foreground Service channel', r));

  const startAndroidForegroundService = async () => {
    const notificationConfig = {
      channelId: 'MyAppChannelID',
      id: 1000,
      title: 'Foreground Service',
      text: 'Starting Android Foreground Service now',
      icon: '../assets/100ms-logo.png',
      priority: 2,
    };
    try {
      VIForegroundService.getInstance().startService(notificationConfig);
    } catch (e) {
      console.error(e);
    }
  };

  startAndroidForegroundService().then(() =>
    console.log('Android Foreground service started')
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
