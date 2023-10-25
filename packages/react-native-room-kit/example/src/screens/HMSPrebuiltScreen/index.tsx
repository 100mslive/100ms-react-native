import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, Text } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { HMSPrebuilt } from '@100mslive/react-native-room-kit';
import type { HMSPrebuiltProps, OnLeaveHandler } from '@100mslive/react-native-room-kit';

import { AppStackParamList } from '../../navigator';

import VIForegroundService from '@voximplant/react-native-foreground-service';

export const HMSPrebuiltScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const screenParams =
    useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>().params;

  // To handle back button press in Prebuilt, when screen is focused
  const isScreenFocused = useIsFocused();

  // function to be called when meeting is ended
  const handleMeetingLeave: OnLeaveHandler = useCallback(async (reason) => {
    console.log(':: reason > ', reason);
    if (Platform.OS === 'android') {
      await VIForegroundService.getInstance().stopService();
    }
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
        screenParams?.tokenEndPoint && screenParams?.initEndPoint && screenParams?.layoutEndPoint
          ? {
              token: screenParams?.tokenEndPoint,
              init: screenParams?.initEndPoint,
              layout: screenParams?.layoutEndPoint,
            }
          : undefined,
      ios: {
        appGroup: 'group.rnroomkit',
        preferredExtension: 'live.100ms.reactnative.RNExampleBroadcastUpload',
      },
    }),
    [screenParams]
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      const startAndroidForegroundService = async () => {
        const androidForegroundServiceChannelConfig = {
          id: 'MyAppChannelID',
          name: 'My App Channel name',
          enableVibration: true,
          importance: 5,
        };
        await VIForegroundService.getInstance().createNotificationChannel(
          androidForegroundServiceChannelConfig
        );

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

      startAndroidForegroundService();
    }
  }, []);

  // Room Code is required to join the room
  if (!roomCode) {
    return <Text>Room Code is Required</Text>;
  }

  return (
    <HMSPrebuilt
      roomCode={roomCode}
      options={prebuiltOptions}
      onLeave={handleMeetingLeave}
      handleBackButton={isScreenFocused}
      autoEnterPipMode={true}
    />
  );
};
