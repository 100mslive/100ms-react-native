import React from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  HMSAudioMixingMode,
  HMSUpdateListenerActions,
  checkNotifications,
} from '@100mslive/react-native-hms';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import {
  changePipModeStatus,
  changeEnableHLSPlayerControls,
  changeShowHLSStats,
  changeShowCustomHLSPlayerControls,
} from '../redux/actions';
import { ModalTypes, PipModes } from '../utils/types';
import { useIsHLSViewer } from '../hooks-util';
import { useIsHLSStreamingOn } from '../hooks-sdk';

interface RoomSettingsModalDebugModeContentProps {
  newAudioMixingMode: HMSAudioMixingMode;
  isAudioShared: boolean;
  audioDeviceListenerAdded: boolean;
  muteAllTracksAudio: boolean;
  closeRoomSettingsModal(): void;
  setModalVisible(modalType: ModalTypes, delay?: boolean): void;
  setIsAudioShared(state: boolean): void;
  setAudioDeviceListenerAdded(state: boolean): void;
  setMuteAllTracksAudio(state: boolean): void;
}

export const RoomSettingsModalDebugModeContent: React.FC<
  RoomSettingsModalDebugModeContentProps
> = ({
  newAudioMixingMode,
  isAudioShared, //
  audioDeviceListenerAdded,
  muteAllTracksAudio,
  closeRoomSettingsModal,
  setModalVisible,
  setIsAudioShared,
  setAudioDeviceListenerAdded,
  setMuteAllTracksAudio,
}) => {
  // REDUX STATES & DISPATCH
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const debugMode = useSelector((state: RootState) => state.user.debugMode);
  const localPeerRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role
  );
  const isHLSStreaming = useIsHLSStreamingOn();

  const pipModeStatus = useSelector(
    (state: RootState) => state.app.pipModeStatus
  );
  const showHLSStats = useSelector(
    (state: RootState) => state.app.joinConfig.showHLSStats
  );
  const enableHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.enableHLSPlayerControls
  );
  const showCustomHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.showCustomHLSPlayerControls
  );
  const isHLSViewer = useIsHLSViewer();

  // CONSTANTS
  const isPipModeUnavailable = pipModeStatus === PipModes.NOT_AVAILABLE;

  //#region FUNCTIONS

  const enterPipMode = async () => {
    if (isPipModeUnavailable) {
      return console.log('PIP mode unavailable on Deice!');
    }

    closeRoomSettingsModal();

    try {
      const isEnabled = await hmsInstance?.enterPipMode({
        aspectRatio: [16, 9], // for 16:9 aspect ratio
        endButton: true,
        videoButton: true,
        audioButton: true,
      });
      if (isEnabled === true) {
        dispatch(changePipModeStatus(PipModes.ACTIVE));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLocalRemoteAudiosMute = () => {
    closeRoomSettingsModal();
    hmsInstance?.setPlaybackForAllAudio(!muteAllTracksAudio);
    setMuteAllTracksAudio(!muteAllTracksAudio);
  };

  const handleRemoteAudiosMute = async () => {
    closeRoomSettingsModal();
    await hmsInstance
      ?.remoteMuteAllAudio()
      .then((d) => console.log('Remote Mute All Audio Success: ', d))
      .catch((e) => console.log('Remote Mute All Audio Error: ', e));
  };

  const handleHLSStreaming = () => {
    if (isHLSStreaming) {
      closeRoomSettingsModal();
      hmsInstance
        ?.stopHLSStreaming()
        .then((d) => console.log('Stop HLS Streaming Success: ', d))
        .catch((e) => console.log('Stop HLS Streaming Error: ', e));
    } else {
      setModalVisible(ModalTypes.HLS_STREAMING, true);
    }
  };

  const addRemoveAudioDeviceChangeListener = () => {
    closeRoomSettingsModal();
    if (hmsInstance) {
      if (audioDeviceListenerAdded) {
        setAudioDeviceListenerAdded(false);

        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
        );
      } else {
        setAudioDeviceListenerAdded(true);

        hmsInstance.setAudioDeviceChangeListener((data: any) => {
          Toast.showWithGravity(
            `Audio Device Output changed to ${data?.device}`,
            Toast.LONG,
            Toast.TOP
          );
        });
      }
    }
  };

  const changeBulkRole = () =>
    setModalVisible(ModalTypes.BULK_ROLE_CHANGE, true);

  const changeTrackState = () =>
    setModalVisible(ModalTypes.CHANGE_TRACK_ROLE, true);

  const switchAudioOutput = () => {
    if (Platform.OS === 'android') {
      setModalVisible(ModalTypes.SWITCH_AUDIO_OUTPUT, true);
    } else {
      closeRoomSettingsModal();
      hmsInstance?.switchAudioOutputUsingIOSUI();
    }
  };

  const changeAudioMode = () =>
    setModalVisible(ModalTypes.CHANGE_AUDIO_MODE, true);

  const setAudioMixingMode = () =>
    setModalVisible(ModalTypes.AUDIO_MIXING_MODE, true);

  const handleHLSPlayerAspectRatio = () => {
    setModalVisible(ModalTypes.HLS_PLAYER_ASPECT_RATIO, true);
  };

  const showRTCStats = () => setModalVisible(ModalTypes.RTC_STATS, true);

  const toggleShowHLSStats = () => {
    dispatch(changeShowHLSStats(!showHLSStats));
    setModalVisible(ModalTypes.DEFAULT);
  };

  const toggleEnableHLSPlayerControls = () => {
    dispatch(changeEnableHLSPlayerControls(!enableHLSPlayerControls));
    setModalVisible(ModalTypes.DEFAULT);
  };

  const toggleShowCustomHLSPlayerControls = () => {
    dispatch(changeShowCustomHLSPlayerControls(!showCustomHLSPlayerControls));
    setModalVisible(ModalTypes.DEFAULT);
  };

  // Android Audioshare
  const handleAudioShare = async () => {
    closeRoomSettingsModal();
    if (isAudioShared) {
      hmsInstance
        ?.stopAudioshare()
        .then((d) => {
          setIsAudioShared(false);
          console.log('Stop Audioshare Success: ', d);
        })
        .catch((e) => console.log('Stop Audioshare Error: ', e));
    } else {
      // check notification permission on android platform
      // Audio share feature needs foreground service running. for Foreground service to keep running, we need active notification.
      if (Platform.OS === 'android') {
        const result = await checkNotifications();

        console.log('Notification Permission Result: ', result);

        if (result.status === 'blocked') {
          Alert.alert(
            'Notification Permission is Blocked!',
            '100ms SDK needs notification permission to start audio share. Please allow notification from settings and try again!',
            [
              { text: 'cancel' },
              { text: 'Go to Settings', onPress: () => Linking.openSettings() },
            ],
            { cancelable: true }
          );
          return;
        }
      }

      hmsInstance
        ?.startAudioshare(newAudioMixingMode)
        .then((d) => {
          setIsAudioShared(true);
          console.log('Start Audioshare Success: ', d);
        })
        .catch((e) => console.log('Start Audioshare Error: ', e));
    }
  };
  //#endregion

  return (
    <ScrollView style={styles.container}>
      {isHLSViewer ? (
        <SettingItem
          onPress={handleHLSPlayerAspectRatio}
          text={'Change Aspect Ratio'}
        />
      ) : null}

      {!isHLSViewer ? (
        <SettingItem
          onPress={handleLocalRemoteAudiosMute}
          text={`${muteAllTracksAudio ? 'Unmute' : 'Mute'} Room`}
        />
      ) : null}

      {debugMode && localPeerRole?.permissions?.hlsStreaming ? (
        <SettingItem
          onPress={handleHLSStreaming}
          text={`${isHLSStreaming === true ? 'Stop' : 'Start'} HLS Streaming`}
        />
      ) : null}

      {debugMode && localPeerRole?.permissions?.changeRole ? (
        <SettingItem onPress={changeBulkRole} text="Bulk Role Change" />
      ) : null}

      {debugMode && localPeerRole?.permissions?.mute ? (
        <SettingItem
          onPress={handleRemoteAudiosMute}
          text="Remote Mute All Audio Tracks"
        />
      ) : null}

      {debugMode &&
      (localPeerRole?.permissions?.mute ||
        localPeerRole?.permissions?.unmute) ? (
        <SettingItem
          onPress={changeTrackState}
          text="Change Track State For Role"
        />
      ) : null}

      {localPeerRole?.publishSettings?.allowed?.includes('audio') ? (
        <SettingItem onPress={switchAudioOutput} text="Switch Audio Output" />
      ) : null}

      {!isPipModeUnavailable ? (
        <SettingItem
          onPress={enterPipMode}
          text="Picture in Picture (PIP) Mode"
        />
      ) : null}

      {debugMode ? (
        <>
          {isHLSViewer ? (
            <>
              <SettingItem
                onPress={toggleShowHLSStats}
                text={showHLSStats ? 'Hide HLS Stats' : 'Show HLS Stats'}
              />

              <SettingItem
                onPress={toggleEnableHLSPlayerControls}
                text={
                  enableHLSPlayerControls
                    ? 'Disable HLS Player Controls'
                    : 'Enable HLS Player Controls'
                }
              />

              <SettingItem
                onPress={toggleShowCustomHLSPlayerControls}
                text={
                  showCustomHLSPlayerControls
                    ? 'Hide Custom HLS Player Controls'
                    : 'Show Custom HLS Player Controls'
                }
              />
            </>
          ) : (
            <>
              <SettingItem onPress={showRTCStats} text="Show RTC Stats" />
            </>
          )}

          {Platform.OS === 'android' &&
          localPeerRole?.publishSettings?.allowed?.includes('audio') ? (
            <>
              <SettingItem
                onPress={addRemoveAudioDeviceChangeListener}
                text={`${
                  audioDeviceListenerAdded ? 'Remove' : 'Set'
                } Audio Output Change Listener`}
              />

              <SettingItem
                onPress={handleAudioShare}
                text={`${isAudioShared ? 'Stop' : 'Start'} Audioshare`}
              />

              <SettingItem onPress={changeAudioMode} text="Set Audio Mode" />

              <SettingItem
                onPress={setAudioMixingMode}
                text="Set Audio Mixing Mode"
              />
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
};

interface SettingItemProps {
  onPress(): void;
  text: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ onPress, text }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    height: 400,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  icon: {
    color: COLORS.WHITE,
    marginRight: 12,
  },
});
