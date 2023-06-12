import {
  HMSAudioMixingMode,
  HMSAudioMode,
  HMSLocalPeer,
} from '@100mslive/react-native-hms';
import React, {useEffect, useState} from 'react';
import {View, InteractionManager} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';

import {styles} from './styles';
import {CustomButton} from './CustomButton';

import {DefaultModal} from './DefaultModal';
import {ModalTypes, PipModes} from '../utils/types';

import type {RootState} from '../redux';
import {changePipModeStatus} from '../redux/actions';
import {
  ChangeAudioMixingModeModal,
  ChangeAudioModeModal,
  ChangeAudioOutputModal,
  ChangeBulkRoleModal,
  ChangeTrackStateForRoleModal,
  HlsStreamingModal,
  RecordingModal,
  RtcStatsModal,
} from './Modals';
import {RoomSettingsModalContent} from './RoomSettingsModalContent';

export const Footer = ({
  isHlsStreaming,
  isBrowserRecording,
  localPeer,
  modalVisible,
  isAudioMute,
  isVideoMute,
  isScreenShared,
  setModalVisible,
  setIsAudioMute,
  setIsVideoMute,
  setIsScreenShared,
}: {
  isHlsStreaming?: boolean;
  isBrowserRecording?: boolean;
  isHlsRecording?: boolean;
  isRtmpStreaming?: boolean;
  localPeer?: HMSLocalPeer;
  modalVisible: ModalTypes;
  isAudioMute?: boolean;
  isVideoMute?: boolean;
  isScreenShared?: boolean;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
  setIsAudioMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsVideoMute: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsScreenShared: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  // hooks
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const roomID = useSelector((state: RootState) => state.user.roomID);
  const isPipActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  // useState hook
  const [muteAllTracksAudio, setMuteAllTracksAudio] = useState(false);
  const [isAudioShared, setIsAudioShared] = useState(false);
  const [audioDeviceChangeListener, setAudioDeviceChangeListener] =
    useState<boolean>(false);
  const [newAudioMixingMode, setNewAudioMixingMode] =
    useState<HMSAudioMixingMode>(HMSAudioMixingMode.TALK_AND_MUSIC);
  const [audioMode, setAudioMode] = useState<HMSAudioMode>(
    HMSAudioMode.MODE_NORMAL,
  );

  // constants
  const iconSize = 20;

  // functions
  const onStartScreenSharePress = () => {
    hmsInstance
      ?.startScreenshare()
      .then(d => {
        console.log('Start Screenshare Success: ', d);
        setIsScreenShared(true);
      })
      .catch(e => console.log('Start Screenshare Error: ', e));
  };

  const onEndScreenSharePress = () => {
    hmsInstance
      ?.stopScreenshare()
      .then(d => {
        console.log('Stop Screenshare Success: ', d);
        setIsScreenShared(false);
      })
      .catch(e => console.log('Stop Screenshare Error: ', e));
  };

  const onSettingsPress = () => {
    InteractionManager.runAfterInteractions(() => {
      setModalVisible(ModalTypes.SETTINGS);
    });
  };

  // Check if PIP is supported or not
  useEffect(() => {
    // Only check for PIP support if PIP is not active
    if (hmsInstance && !isPipActive) {
      const check = async () => {
        try {
          const isSupported = await hmsInstance.isPipModeSupported();

          if (!isSupported) {
            dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
          }
        } catch (error) {
          dispatch(changePipModeStatus(PipModes.NOT_AVAILABLE));
        }
      };

      check();
    }
  }, [isPipActive, hmsInstance]);

  return (
    <View
      style={[
        // localPeer?.role?.permissions?.hlsStreaming
        //   ? styles.iconBotttomWrapperHls :
        styles.iconBotttomWrapper,
      ]}
    >
      <View style={styles.iconBotttomButtonWrapper}>
        {localPeer?.role?.publishSettings?.allowed?.includes('audio') && (
          <CustomButton
            onPress={() => {
              localPeer?.localAudioTrack()?.setMute(!isAudioMute);
              setIsAudioMute(!isAudioMute);
            }}
            viewStyle={[styles.iconContainer, isAudioMute && styles.iconMuted]}
            LeftIcon={
              <Feather
                name={isAudioMute ? 'mic-off' : 'mic'}
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
          <CustomButton
            onPress={() => {
              localPeer?.localVideoTrack()?.setMute(!isVideoMute);
              setIsVideoMute(!isVideoMute);
            }}
            viewStyle={[styles.iconContainer, isVideoMute && styles.iconMuted]}
            LeftIcon={
              <Feather
                name={isVideoMute ? 'video-off' : 'video'}
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        {/* {localPeer?.role?.permissions?.hlsStreaming &&
          (room?.hlsStreamingState?.running ? (
            <CustomButton
              onPress={() => setModalVisible(ModalTypes.END_HLS_STREAMING)}
              viewStyle={styles.endLiveIconContainer}
              LeftIcon={
                <Feather
                  name="stop-circle"
                  style={styles.icon}
                  size={iconSize}
                />
              }
            />
          ) : (
            <CustomButton
              onPress={() => console.log('onGoLivePress')}
              viewStyle={styles.goLiveIconContainer}
              LeftIcon={
                <Ionicons
                  name="radio-outline"
                  style={styles.icon}
                  size={iconSize * 2}
                />
              }
            />
          ))} */}
        {localPeer?.role?.publishSettings?.allowed?.includes('screen') && (
          <CustomButton
            onPress={
              isScreenShared ? onEndScreenSharePress : onStartScreenSharePress
            }
            viewStyle={[
              styles.iconContainer,
              isScreenShared && styles.iconMuted,
            ]}
            LeftIcon={
              <MaterialCommunityIcons
                name="monitor-share"
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
        <CustomButton
          onPress={onSettingsPress}
          viewStyle={styles.iconContainer}
          LeftIcon={
            <MaterialCommunityIcons
              name="dots-vertical"
              style={styles.icon}
              size={iconSize}
            />
          }
        />
      </View>
      {/* {localPeer?.role?.permissions?.hlsStreaming &&
        (room?.hlsStreamingState?.running ? (
          <Text style={styles.liveText}>End stream</Text>
        ) : (
          <Text style={styles.liveText}>Go Live</Text>
        ))} */}
      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={modalVisible === ModalTypes.SETTINGS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <RoomSettingsModalContent
          localPeer={localPeer}
          isHLSStreaming={isHlsStreaming}
          rtmpAndRecording={isBrowserRecording}
          newAudioMixingMode={newAudioMixingMode}
          audioDeviceListenerAdded={audioDeviceChangeListener}
          isAudioShared={isAudioShared}
          muteAllTracksAudio={muteAllTracksAudio}
          closeRoomSettingsModal={() => setModalVisible(ModalTypes.DEFAULT)}
          setModalVisible={setModalVisible}
          setAudioDeviceListenerAdded={setAudioDeviceChangeListener}
          setIsAudioShared={setIsAudioShared}
          setMuteAllTracksAudio={setMuteAllTracksAudio}
        />
      </DefaultModal>
      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={modalVisible === ModalTypes.RTC_STATS}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <RtcStatsModal />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={
          modalVisible === ModalTypes.RECORDING ||
          modalVisible === ModalTypes.RESOLUTION
        }
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <RecordingModal
          instance={hmsInstance}
          roomID={roomID}
          setModalVisible={setModalVisible}
          recordingModal={modalVisible === ModalTypes.RECORDING}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <HlsStreamingModal
          instance={hmsInstance}
          roomID={roomID}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK_ROLE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeTrackStateForRoleModal
          instance={hmsInstance}
          localPeer={localPeer}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SWITCH_AUDIO_OUTPUT}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioOutputModal
          instance={hmsInstance}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_AUDIO_MODE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioModeModal
          instance={hmsInstance}
          audioMode={audioMode}
          setAudioMode={setAudioMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.AUDIO_MIXING_MODE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeAudioMixingModeModal
          instance={hmsInstance}
          newAudioMixingMode={newAudioMixingMode}
          setNewAudioMixingMode={setNewAudioMixingMode}
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.BULK_ROLE_CHANGE}
        setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
      >
        <ChangeBulkRoleModal
          cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
        />
      </DefaultModal>
    </View>
  );
};
