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
import type {
  HMSPrebuiltProps,
  OnLeaveHandler,
} from '@100mslive/react-native-room-kit';

import { AppStackParamList } from '../../navigator';

import VIForegroundService from '@voximplant/react-native-foreground-service';

export const HMSPrebuiltScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const screenParams =
    useRoute<RouteProp<AppStackParamList, 'HMSPrebuiltScreen'>>().params;

  // To handle back button press in Prebuilt, when screen is focused
  const isScreenFocused = useIsFocused();

  /**
   * Handles the event when a Room is left.
   *
   * This function is triggered when the user leaves a Room. It performs necessary cleanup actions,
   * such as stopping the Android foreground service to free up system resources. After performing these
   * actions, it navigates the user to the `QRCodeScreen`.
   *
   * @param {string} reason - The reason for leaving the Room
   */
  const handleMeetingLeave: OnLeaveHandler = useCallback(async (reason) => {
    console.log(':: reason > ', reason); // Logs the reason for leaving the meeting.
    if (Platform.OS === 'android') {
      await VIForegroundService.getInstance().stopService(); // Stops the foreground service on Android.
    }
    navigation.navigate('QRCodeScreen'); // Navigates to the QRCodeScreen.
  }, []);

  // room code of the HMSRoom
  const roomCode = screenParams?.roomCode;

  // HMSPrebuilt component options
  const prebuiltOptions: HMSPrebuiltProps['options'] = useMemo(
    () => ({
      // userName: The name of the user joining the video conference.
      userName: screenParams?.userName,
      // userId: A unique identifier for the user in the video conference.
      userId: screenParams?.userId,
      // debugMode: If true, enables additional logging for debugging purposes.
      debugMode: screenParams?.debugMode,
      // endPoints: Specifies the endpoints for token, initialization, and layout configuration.
      // Only defined if all endpoints are provided in screenParams.
      endPoints:
        screenParams?.tokenEndPoint &&
        screenParams?.initEndPoint &&
        screenParams?.layoutEndPoint
          ? {
              token: screenParams?.tokenEndPoint, // Endpoint for obtaining the token.
              init: screenParams?.initEndPoint, // Endpoint for initialization.
              layout: screenParams?.layoutEndPoint, // Endpoint for layout configuration.
            }
          : undefined,
      // ios: Configuration specific to iOS devices.
      ios: {
        appGroup: 'group.rnroomkit', // The app group identifier for shared resources.
        preferredExtension: 'live.100ms.reactnative.RNExampleBroadcastUpload', // The identifier for the broadcast upload extension.
      },
    }),
    [screenParams] // Recomputes the memoized value when screenParams changes.
  );

  useEffect(() => {
    // Checks if the platform is Android before attempting to start the foreground service.
    // This is necessary because the foreground service functionality is specific to Android.
    if (Platform.OS === 'android') {
      // Defines an asynchronous function to start the Android foreground service.
      const startAndroidForegroundService = async () => {
        // Configuration for the Android notification channel.
        // This is required for Android O and above to show notifications.
        const androidForegroundServiceChannelConfig = {
          id: 'MyAppChannelID', // Unique ID for the notification channel.
          name: 'My App Channel name', // Name for the notification channel.
          enableVibration: true, // Enables vibration for notifications from this channel.
          importance: 5, // Sets the importance level for notifications from this channel.
        };
        // Creates the notification channel with the specified configuration.
        await VIForegroundService.getInstance().createNotificationChannel(
          androidForegroundServiceChannelConfig
        );

        // Configuration for the notification that will be shown while the service is running.
        const notificationConfig = {
          channelId: 'MyAppChannelID', // Associates the notification with the created channel ID.
          id: 1000, // Unique ID for the notification.
          title: 'Foreground Service', // Title for the notification.
          text: 'Starting Android Foreground Service now', // Text content for the notification.
          icon: '../assets/100ms-logo.png', // Icon for the notification.
          priority: 2, // Priority for the notification.
        };
        // Attempts to start the foreground service with the specified notification configuration.
        try {
          VIForegroundService.getInstance().startService(notificationConfig);
        } catch (e) {
          // Logs an error if starting the foreground service fails.
          console.error(e);
        }
      };

      // Calls the function to start the Android foreground service.
      startAndroidForegroundService();
    }
  }, []); // The empty dependency array ensures this effect runs only once after the initial render.

  // Room Code is required to join the room
  if (!roomCode) {
    return <Text>Room Code is Required</Text>;
  }

  return (
    /**
     * Renders the `HMSPrebuilt` component for a given Room code.
     *
     * This component is responsible for displaying the video conferencing UI, handling user interactions,
     * and managing the video conferencing session. It uses the `roomCode` to join the correct room,
     * `options` to configure the session, and provides callbacks for significant events such as leaving the room.
     *
     * @param {string} roomCode - The unique code for the room to join.
     * @param {Object} options - Configuration options for the video conference, including user details and debug settings.
     * @param {Function} onLeave - Callback function that is called when the meeting is left.
     * @param {boolean} handleBackButton - Determines if the back button press should be handled by the component.
     * @param {boolean} autoEnterPipMode - Automatically enters Picture-in-Picture mode when the app goes into the background (if supported).
     */
    <HMSPrebuilt
      roomCode={roomCode}
      options={prebuiltOptions}
      onLeave={handleMeetingLeave}
      handleBackButton={isScreenFocused}
      autoEnterPipMode={true}
    />
  );
};
