// import {
//   HMSAudioTrackSettings,
//   HMSCameraFacing,
//   HMSIOSAudioMode,
//   HMSLogAlarmManager,
//   HMSLogger,
//   HMSLogLevel,
//   HMSLogSettings,
//   HMSSDK,
//   HMSTrackSettings,
//   HMSTrackSettingsInitState,
//   HMSVideoTrackSettings,
// } from '@100mslive/react-native-hms';
// import { useEffect, useState } from 'react';

// export const useHmsInstance = () => {
//   const [hmsInstance, setHmsInstance] = useState(null);

//   useEffect(() => {
//     const setupInstance = async () => {
//       /**
//        * Only required for advanced use-case features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
//        * NOT required for any other features.
//        * @link https://www.100ms.live/docs/react-native/v2/advanced-features/track-settings
//        */
//       const trackSettings = getTrackSettings({
//         mutedAudio,
//         mutedVideo,
//         audioMixer,
//         autoResize,
//         musicMode,
//         softwareDecoder,
//       });

//       const logSettings = getLogSettings();

//       /**
//        * Regular Usage Example :-
//        * ```
//        * const hmsInstance = await HMSSDK.build();
//        * ```
//        *
//        *
//        * Advanced Usage Example :-
//        * @param {trackSettings} trackSettings is an optional value only required to enable features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
//        *
//        * @param {appGroup} appGroup is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
//        *
//        * @param {preferredExtension} preferredExtension is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
//        *
//        * ```
//        * const trackSettings = getTrackSettings();
//        *
//        * const hmsInstance = await HMSSDK.build({
//        *    trackSettings,
//        *    appGroup: 'group.reactnativehms', // required for iOS Screenshare, not required for Android
//        *    preferredExtension: 'RNHMSExampleBroadcastUpload', // required for iOS Screenshare, not required for Android
//        * });
//        * ```
//        */
//       const hmsInstance = await HMSSDK.build({
//         logSettings,
//         trackSettings,
//         appGroup: 'group.reactnativehms',
//         preferredExtension:
//           'live.100ms.reactnative.RNHMSExampleBroadcastUpload',
//       });

//       // create logger for hmssdk
//       const logger = new HMSLogger();
//       logger.updateLogLevel(HMSLogLevel.VERBOSE, true);

//       // set logger on hmssdk
//       hmsInstance.setLogger(logger);
//     };

//     setupInstance();
//   }, []);

//   return hmsInstance;
// };

// type TrackConfigs = {
//   mutedAudio: boolean;
//   audioMixer: boolean; // IOS only
//   musicMode: boolean; // IOS only
//   mutedVideo: boolean;
//   autoResize: boolean; // Android only
//   softwareDecoder: boolean; // Android only
// };

// const getTrackSettings = (config: TrackConfigs) => {
//   const {
//     mutedAudio,
//     audioMixer,
//     musicMode,
//     mutedVideo,
//     autoResize,
//     softwareDecoder,
//   } = config;

//   const listOfFaultyDevices = [
//     'Pixel',
//     'Pixel XL',
//     'Moto G5',
//     'Moto G (5S) Plus',
//     'Moto G4',
//     'TA-1053',
//     'Mi A1',
//     'Mi A2',
//     'E5823', // Sony z5 compact
//     'Redmi Note 5',
//     'FP2', // Fairphone FP2
//     'MI 5',
//   ];
//   const deviceModal = getModel();

//   /**
//    * Customize local peer's Audio track settings before Joining the Room.
//    *
//    * Checkout Track Settings docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/track-settings}
//    */
//   let audioSettings = new HMSAudioTrackSettings({
//     initialState: mutedAudio
//       ? HMSTrackSettingsInitState.MUTED
//       : HMSTrackSettingsInitState.UNMUTED,
//     useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal)
//       ? true
//       : false,
//     audioSource: audioMixer
//       ? [
//           'mic_node',
//           'screen_broadcast_audio_receiver_node',
//           'audio_file_player_node',
//         ]
//       : undefined,
//     /**
//      * `audioMode` param allows you to capture audio in its highest quality
//      * by disabling voice processing and increasing the maximum bandwidth limit
//      *
//      * Checkout Music Mode docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/microphone/music-mode}
//      */
//     audioMode: musicMode ? HMSIOSAudioMode.MUSIC : undefined,
//   });

//   /**
//    * Customize local peer's Video track settings before Joining the Room.
//    *
//    * Checkout Track Settings docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/track-settings}
//    */
//   let videoSettings = new HMSVideoTrackSettings({
//     initialState: mutedVideo
//       ? HMSTrackSettingsInitState.MUTED
//       : HMSTrackSettingsInitState.UNMUTED,
//     cameraFacing: HMSCameraFacing.FRONT,
//     disableAutoResize: !autoResize,
//     forceSoftwareDecoder: softwareDecoder,
//   });

//   return new HMSTrackSettings({
//     video: videoSettings,
//     audio: audioSettings,
//   });
// };

// const getLogSettings = () => {
//   return new HMSLogSettings({
//     level: HMSLogLevel.VERBOSE,
//     isLogStorageEnabled: true,
//     maxDirSizeInBytes: HMSLogAlarmManager.DEFAULT_DIR_SIZE,
//   });
// };
