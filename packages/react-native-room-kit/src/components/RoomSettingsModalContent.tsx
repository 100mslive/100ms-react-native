import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { HMSAudioMixingMode } from '@100mslive/react-native-hms';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { ModalTypes } from '../utils/types';
import { groupIntoTriplets, parseMetadata } from '../utils/functions';
import {
  BRBIcon,
  ParticipantsIcon,
  RecordingIcon,
  ScreenShareIcon,
} from '../Icons';
import { BottomSheet, useBottomSheetActions } from './BottomSheet';
import {
  useHMSConferencingScreenConfig,
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
  useShowParticipantsSheet,
} from '../hooks-util';
import { useCanPublishScreen, useHMSActions } from '../hooks-sdk';
import { RoomSettingsModalDebugModeContent } from './RoomSettingsModalDebugModeContent';
import { setStartingOrStoppingRecording } from '../redux/actions';
import { ParticipantsCount } from './ParticipantsCount';

interface RoomSettingsModalContentProps {
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

export const RoomSettingsModalContent: React.FC<
  RoomSettingsModalContentProps
> = (props) => {
  const { closeRoomSettingsModal, setModalVisible } = props;

  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const debugMode = useSelector((state: RootState) => state.user.debugMode);

  const hmsActions = useHMSActions();

  const { registerOnModalHideAction } = useBottomSheetActions();

  const showParticipantList = useShowParticipantsSheet();

  // #region Participants related states and functions
  const onParticipantsPress = () => {
    // Register callback to be called when bottom sheet is hidden
    registerOnModalHideAction(showParticipantList);

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };
  // #endregion

  // #region Screen Share related states and functions
  const canPublishScreen = useCanPublishScreen();

  const isLocalScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared
  );

  const handleScreenShareTogglePress = async () => {
    closeRoomSettingsModal();
    await hmsActions.setScreenShareEnabled(!isLocalScreenShared);
  };
  // #endregion

  // #region "BRB" and "Hand Raise" related states and functions
  const localPeerMetadata = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.metadata
  );

  const parsedMetadata = parseMetadata(localPeerMetadata);

  const isBRBOn = !!parsedMetadata.isBRBOn;

  const toggleBRB = async () => {
    const newMetadata = {
      ...parsedMetadata,
      isHandRaised: false,
      isBRBOn: !isBRBOn,
    };
    closeRoomSettingsModal();
    await hmsActions.changeMetadata(newMetadata);
  };
  // #endregion

  // #region Recording related states and functions
  const canStartRecording = useSelector(
    (state: RootState) =>
      !!state.hmsStates.localPeer?.role?.permissions?.browserRecording
  );

  const isRecordingOn = useSelector(
    (state: RootState) => !!state.hmsStates.room?.browserRecordingState?.running
  );

  const handleRecordingTogglePress = () => {
    if (isRecordingOn) {
      registerOnModalHideAction(() => {
        setModalVisible(ModalTypes.STOP_RECORDING);
      });
      closeRoomSettingsModal();
    } else {
      dispatch(setStartingOrStoppingRecording(true));
      hmsInstance
        .startRTMPOrRecording({ record: true })
        .catch(() => dispatch(setStartingOrStoppingRecording(false)));
      closeRoomSettingsModal();
    }
  };
  // #endregion

  const canShowParticipants = useHMSConferencingScreenConfig(
    (conferencingScreenConfig) =>
      !!conferencingScreenConfig?.elements?.participant_list
  );

  const canShowBRB = useHMSLayoutConfig(
    (layoutConfig) =>
      !!layoutConfig?.screens?.conferencing?.default?.elements?.brb
  );

  return (
    <View>
      <BottomSheet.Header
        dismissModal={closeRoomSettingsModal}
        heading="Options"
      />

      <BottomSheet.Divider />

      <View style={styles.contentContainer}>
        {groupIntoTriplets(
          [
            {
              id: 'participants',
              icon: <ParticipantsIcon style={{ width: 20, height: 20 }} />,
              label: 'Participants',
              pressHandler: onParticipantsPress,
              isActive: false,
              hide: !canShowParticipants,
              sibling: <ParticipantsCount />,
              // parent
              // children
            },
            {
              id: 'share-screen',
              icon: <ScreenShareIcon style={{ width: 20, height: 20 }} />,
              label: isLocalScreenShared ? 'Sharing Screen' : 'Share Screen',
              pressHandler: handleScreenShareTogglePress,
              isActive: !!isLocalScreenShared, // Show active if screen is shared
              hide: !canPublishScreen, // Hide if can't publish screen
            },
            {
              id: 'brb',
              icon: <BRBIcon style={{ width: 20, height: 20 }} />,
              label: isBRBOn ? "I'm Back" : 'Be Right Back',
              pressHandler: toggleBRB,
              isActive: isBRBOn, // Show active if `isBRBOn` is set on metadata
              hide: !canShowBRB, // Hide if can't publish screen
            },
            {
              id: 'start-recording',
              icon: <RecordingIcon style={{ width: 20, height: 20 }} />,
              label: isRecordingOn ? 'Stop Recording' : 'Start Recording',
              pressHandler: handleRecordingTogglePress,
              isActive: isRecordingOn,
              hide: !canStartRecording, // Hide if can't publish screen
            },
          ].filter((itm) => !itm.hide),
          true
        ).map((itm, idx) => {
          const isFirst = idx === 0;

          return (
            <React.Fragment key={idx.toString()}>
              {isFirst ? null : <View style={styles.rowSpacer} />}

              <View style={styles.row}>
                {itm.map((item, index) => {
                  const isFirst = index === 0;

                  return (
                    <React.Fragment key={item ? item.id : index.toString()}>
                      {isFirst ? null : <View style={styles.colSpacer} />}

                      <View style={styles.col}>
                        {item ? (
                          <>
                            <SettingItem
                              icon={item.icon}
                              onPress={item.pressHandler}
                              text={item.label}
                              isActive={item.isActive}
                            />

                            {item.sibling}
                          </>
                        ) : null}
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {debugMode ? <RoomSettingsModalDebugModeContent {...props} /> : null}
    </View>
  );
};

type SettingItemProps = {
  text: string;
  icon: React.ReactElement;
  onPress(): void;
  isActive?: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({
  text,
  icon,
  onPress,
  isActive = false,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.surface_bright,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  return (
    <TouchableOpacity
      style={[styles.button, isActive ? hmsRoomStyles.button : null]}
      onPress={onPress}
    >
      {icon}

      <Text style={[styles.text, hmsRoomStyles.text]} numberOfLines={2}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
  },
  rowSpacer: {
    height: 16,
    width: '100%',
  },
  col: {
    flex: 1,
    position: 'relative',
  },
  colSpacer: {
    width: 12,
    height: '100%',
  },
  button: {
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginTop: 8,
  },
});
