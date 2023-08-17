import * as React from 'react';
import { View } from 'react-native';
import { HMSAudioMixingMode, HMSAudioMode } from '@100mslive/react-native-hms';

import { PressableIcon } from './PressableIcon';
import { HamburgerIcon } from '../Icons';
import { DefaultModal } from './DefaultModal';
import { RoomSettingsModalContent } from './RoomSettingsModalContent';
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
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { ChangeNameModalContent } from './ChangeNameModalContent';
import { StopRecordingModalContent } from './StopRecordingModalContent';

interface HMSRoomOptionsProps {}

export const HMSRoomOptions: React.FC<HMSRoomOptionsProps> = () => {
  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();
  const [isAudioShared, setIsAudioShared] = React.useState(false);
  const [audioMode, setAudioMode] = React.useState<HMSAudioMode>(
    HMSAudioMode.MODE_NORMAL
  );
  const [muteAllTracksAudio, setMuteAllTracksAudio] = React.useState(false);
  const [audioDeviceChangeListener, setAudioDeviceChangeListener] =
    React.useState<boolean>(false);
  const [newAudioMixingMode, setNewAudioMixingMode] = React.useState(
    HMSAudioMixingMode.TALK_AND_MUSIC
  );

  const onSettingsPress = () => setModalVisible(ModalTypes.SETTINGS);

  const dismissModal = () => setModalVisible(ModalTypes.DEFAULT);

  return (
    <View>
      <PressableIcon onPress={onSettingsPress}>
        <HamburgerIcon />
      </PressableIcon>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.SETTINGS}
        dismissModal={dismissModal}
        animationOutTiming={800}
      >
        <RoomSettingsModalContent
          newAudioMixingMode={newAudioMixingMode}
          audioDeviceListenerAdded={audioDeviceChangeListener}
          isAudioShared={isAudioShared}
          muteAllTracksAudio={muteAllTracksAudio}
          closeRoomSettingsModal={dismissModal}
          setModalVisible={setModalVisible}
          setAudioDeviceListenerAdded={setAudioDeviceChangeListener}
          setIsAudioShared={setIsAudioShared}
          setMuteAllTracksAudio={setMuteAllTracksAudio}
        />
      </BottomSheet>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.CHANGE_NAME}
        dismissModal={dismissModal}
        avoidKeyboard={true}
        animationOutTiming={800}
      >
        <ChangeNameModalContent dismissModal={dismissModal} />
      </BottomSheet>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.STOP_RECORDING}
        dismissModal={dismissModal}
        animationOutTiming={800}
      >
        <StopRecordingModalContent dismissModal={dismissModal} />
      </BottomSheet>

      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={modalVisible === ModalTypes.RTC_STATS}
        setModalVisible={dismissModal}
      >
        <RtcStatsModal />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.RECORDING}
        setModalVisible={dismissModal}
      >
        <RecordingModal setModalVisible={setModalVisible} />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.HLS_STREAMING}
        setModalVisible={dismissModal}
      >
        <HlsStreamingModal cancelModal={dismissModal} />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_TRACK_ROLE}
        setModalVisible={dismissModal}
      >
        <ChangeTrackStateForRoleModal cancelModal={dismissModal} />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.SWITCH_AUDIO_OUTPUT}
        setModalVisible={dismissModal}
      >
        <ChangeAudioOutputModal cancelModal={dismissModal} />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.CHANGE_AUDIO_MODE}
        setModalVisible={dismissModal}
      >
        <ChangeAudioModeModal
          audioMode={audioMode}
          setAudioMode={setAudioMode}
          cancelModal={dismissModal}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.AUDIO_MIXING_MODE}
        setModalVisible={dismissModal}
      >
        <ChangeAudioMixingModeModal
          newAudioMixingMode={newAudioMixingMode}
          setNewAudioMixingMode={setNewAudioMixingMode}
          cancelModal={dismissModal}
        />
      </DefaultModal>
      <DefaultModal
        modalPosiion="center"
        modalVisible={modalVisible === ModalTypes.BULK_ROLE_CHANGE}
        setModalVisible={dismissModal}
      >
        <ChangeBulkRoleModal cancelModal={dismissModal} />
      </DefaultModal>
    </View>
  );
};
