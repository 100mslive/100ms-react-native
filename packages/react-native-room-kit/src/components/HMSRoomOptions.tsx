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
import { TestIds } from '../utils/constants';
import { PollsAndQuizBottomSheet } from './PollsAndQuizBottomSheet';
import { VirtualBackgroundBottomSheet } from './VirtualBackgroundBottomSheet';
import { CaptionsModalContent } from './CaptionsModalContent';

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
      <PressableIcon
        testID={TestIds.room_options_btn}
        onPress={onSettingsPress}
      >
        <HamburgerIcon />
      </PressableIcon>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.SETTINGS}
        dismissModal={dismissModal}
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

      <PollsAndQuizBottomSheet />

      <VirtualBackgroundBottomSheet />

      <BottomSheet
        isVisible={modalVisible === ModalTypes.CLOSED_CAPTIONS_CONTROL}
        dismissModal={dismissModal}
      >
        <CaptionsModalContent dismissModal={dismissModal} />
      </BottomSheet>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.CHANGE_NAME}
        dismissModal={dismissModal}
        avoidKeyboard={true}
      >
        <ChangeNameModalContent dismissModal={dismissModal} />
      </BottomSheet>

      <BottomSheet
        isVisible={modalVisible === ModalTypes.STOP_RECORDING}
        dismissModal={dismissModal}
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
