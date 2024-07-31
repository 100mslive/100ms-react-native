import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
import type { HMSAudioMixingMode } from '@100mslive/react-native-hms';
import {
  HMSRecordingState,
  TranscriptionState,
  TranscriptionsMode,
} from '@100mslive/react-native-hms';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { ModalTypes } from '../utils/types';
import { groupIntoTriplets, parseMetadata } from '../utils/functions';
import {
  BRBIcon,
  CCIcon,
  HandIcon,
  ParticipantsIcon,
  PencilIcon,
  PollVoteIcon,
  RecordingIcon,
  ScreenShareIcon,
  VirtualBackgroundIcon,
  WaveIcon,
} from '../Icons';
import { BottomSheet, useBottomSheetActions } from './BottomSheet';
import {
  isPublishingAllowed,
  useHMSConferencingScreenConfig,
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
  useStartRecording,
} from '../hooks-util';
import {
  useCanPublishAudio,
  useCanPublishScreen,
  useCanPublishVideo,
  useHMSActions,
  useIsAnyStreamingOn,
} from '../hooks-sdk';
import { RoomSettingsModalDebugModeContent } from './RoomSettingsModalDebugModeContent';
import { ParticipantsCount } from './ParticipantsCount';
import { selectAllowedTracksToPublish } from '../hooks-sdk-selectors';
import { TestIds } from '../utils/constants';
import { addNotification, setShowClosedCaptions } from '../redux/actions';
import { NotificationTypes } from '../types';

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

  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const debugMode = useSelector((state: RootState) => state.user.debugMode);

  const hmsActions = useHMSActions();

  const { alert_error_default: alertErrorDefaultColor } =
    useHMSRoomColorPalette();

  const isPublisher = useSelector((state: RootState) => {
    const localPeer = state.hmsStates.localPeer;
    return localPeer ? isPublishingAllowed(localPeer) : false;
  });
  const editUsernameDisabled = useSelector(
    (state: RootState) => state.app.editUsernameDisabled
  );

  const canReadOrWritePoll = useSelector((state: RootState) => {
    const permissions = state.hmsStates.localPeer?.role?.permissions;
    return permissions?.pollRead || permissions?.pollWrite;
  });

  const whiteboardAdminPermission = useSelector((state: RootState) => {
    return !!state.hmsStates.localPeer?.role?.permissions?.whiteboard?.admin;
  });

  const { registerOnModalHideAction } = useBottomSheetActions();

  const { canShowParticipants, show } = useShowChatAndParticipants();

  // #region Participants related states and functions
  const onParticipantsPress = () => {
    // Register callback to be called when bottom sheet is hidden
    registerOnModalHideAction(() => show('participants'));

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
  const isHandRaised = useSelector(
    (state: RootState) => !!state.hmsStates.localPeer?.isHandRaised
  );

  const toggleRaiseHand = async () => {
    closeRoomSettingsModal();
    if (isBRBOn) {
      const newMetadata = {
        ...parsedMetadata,
        isBRBOn: false,
      };
      await hmsActions.changeMetadata(newMetadata);
    }
    if (isHandRaised) {
      await hmsActions.lowerLocalPeerHand();
    } else {
      await hmsActions.raiseLocalPeerHand();
    }
  };

  const toggleBRB = async () => {
    const newMetadata = {
      ...parsedMetadata,
      isBRBOn: !isBRBOn,
    };
    closeRoomSettingsModal();
    await hmsActions.changeMetadata(newMetadata);
    if (isHandRaised) {
      await hmsActions.lowerLocalPeerHand();
    }
  };
  // #endregion

  // #region Recording related states and functions
  const canStartRecording = useSelector(
    (state: RootState) =>
      !!state.hmsStates.localPeer?.role?.permissions?.browserRecording
  );
  const isAnyStreamingOn = useIsAnyStreamingOn();

  const isRecordingOn = useSelector((state: RootState) => {
    const room = state.hmsStates.room;
    return (
      room?.browserRecordingState?.state === HMSRecordingState.RESUMED ||
      room?.browserRecordingState?.state === HMSRecordingState.STARTED
    );
  });
  const isRecordingPaused = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.browserRecordingState?.state ===
      HMSRecordingState.PAUSED
  );
  const isRecordingDisabled = useSelector((state: RootState) => {
    const room = state.hmsStates.room;
    return (
      isAnyStreamingOn ||
      room?.browserRecordingState?.state === HMSRecordingState.STARTING
    );
  });

  const { startRecording } = useStartRecording();

  const handleRecordingTogglePress = () => {
    if (isRecordingOn) {
      registerOnModalHideAction(() => {
        setModalVisible(ModalTypes.STOP_RECORDING);
      });
      closeRoomSettingsModal();
    } else {
      startRecording();
      closeRoomSettingsModal();
    }
  };
  // #endregion

  // #region Noise Cancellation Plugin
  const noiseCancellationPlugin = useSelector(
    (state: RootState) => state.hmsStates.noiseCancellationPlugin
  );
  const [isNoiseCancellationEnabled, setIsNoiseCancellationEnabled] =
    React.useState(false);
  const [isNoiseCancellationAvailable, setIsNoiseCancellationAvailable] =
    React.useState(false);

  const canPublishAudio = useCanPublishAudio();

  const isLocalAudioMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalAudioMuted
  );

  const showNoiseCancellationButton =
    canPublishAudio && isNoiseCancellationAvailable;

  React.useEffect(() => {
    if (noiseCancellationPlugin) {
      let mounted = true;

      Promise.all(
        [
          noiseCancellationPlugin.isEnabled(),
          noiseCancellationPlugin.isNoiseCancellationAvailable(),
        ].map((promise) =>
          promise
            .then((value) => ({ status: 'fulfilled' as const, value }))
            .catch((reason) => ({ status: 'rejected' as const, reason }))
        )
      ).then((results) => {
        const [isEnabledResult, isAvailableResult] = results;
        if (mounted) {
          if (isEnabledResult && isEnabledResult.status === 'fulfilled') {
            setIsNoiseCancellationEnabled(isEnabledResult.value);
          }
          if (isAvailableResult && isAvailableResult.status === 'fulfilled') {
            setIsNoiseCancellationAvailable(isAvailableResult.value);
          }
        }
      });

      return () => {
        mounted = false;
      };
    }
  }, [noiseCancellationPlugin]);

  const handleNoiseCancellation = () => {
    // Register callback to be called when bottom sheet is hidden
    registerOnModalHideAction(() => {
      if (!noiseCancellationPlugin || !isNoiseCancellationAvailable) return;

      if (isNoiseCancellationEnabled) {
        noiseCancellationPlugin.disable();
      } else {
        noiseCancellationPlugin.enable();
      }
    });

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };
  // #endregion

  // #region Virtual Background
  const canPublishVideo = useCanPublishVideo();
  const videoPlugin = useSelector(
    (state: RootState) => state.hmsStates.videoPlugin
  );
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );
  const virtualBackgroundApplied = useSelector(
    (state: RootState) => state.app.selectedVirtualBackground !== null
  );
  const handleVirtualBackground = () => {
    // Register callback to be called when bottom sheet is hiddden
    registerOnModalHideAction(() => {
      if (!videoPlugin || isLocalVideoMuted) return;
      setModalVisible(ModalTypes.VIRTUAL_BACKGROUND);
    });
    // Close the current bottom sheet
    closeRoomSettingsModal();
  };
  // #endregion

  // #region Closed Captions
  const isCCAdmin = useSelector((state: RootState) => {
    const captionPermission =
      state.hmsStates.localPeer?.role?.permissions?.transcriptions?.find(
        (element) => element.mode === TranscriptionsMode.CAPTION
      );
    return captionPermission?.admin || false;
  });

  const ccEnabledForEveryone = useSelector((state: RootState) => {
    const captionTranscription = state.hmsStates.room?.transcriptions?.find(
      (transcription) => transcription.mode === TranscriptionsMode.CAPTION
    );

    return captionTranscription
      ? captionTranscription.state === TranscriptionState.STARTED
      : false;
  });

  const ccEnabledForSelf = useSelector(
    (state: RootState) => state.app.showClosedCaptions
  );

  const handleCCForSelf = () => {
    dispatch(setShowClosedCaptions(!ccEnabledForSelf));

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };

  const handleCCForEveryone = () => {
    // Register callback to be called when bottom sheet is hiddden
    registerOnModalHideAction(() => {
      setModalVisible(ModalTypes.CLOSED_CAPTIONS_CONTROL);
    });

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };
  // #endregion

  const changeName = () => {
    // Register callback to be called when bottom sheet is hiddden
    registerOnModalHideAction(() => {
      setModalVisible(ModalTypes.CHANGE_NAME);
    });

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };

  const openPollsQuizzesModal = () => {
    registerOnModalHideAction(() => {
      setModalVisible(ModalTypes.POLLS_AND_QUIZZES);
    });

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };

  const whiteboard = useSelector(
    (state: RootState) => state.hmsStates.whiteboard
  );
  const screenShareNodesAvailable = useSelector(
    (state: RootState) => state.app.screensharePeerTrackNodes.length > 0
  );

  const toggleWhiteboard = async () => {
    if (!whiteboardAdminPermission) return;

    if (whiteboard && whiteboard.isOwner) {
      hmsInstance.interactivityCenter
        .stopWhiteboard()
        .then((success) => {
          console.log('#stopWhiteboard stopped whiteboard ', success);
        })
        .catch((error) => {
          console.log('#stopWhiteboard error ', error);
        });
    } else if (whiteboard && !whiteboard.isOwner) {
      const uid = Math.random().toString(16).slice(2);
      dispatch(
        addNotification({
          id: uid,
          type: NotificationTypes.ERROR,
          title:
            'Only the peer who started the whiteboard has the ability to close it!',
        })
      );
    } else if (isLocalScreenShared || screenShareNodesAvailable) {
      const uid = Math.random().toString(16).slice(2);
      dispatch(
        addNotification({
          id: uid,
          type: NotificationTypes.ERROR,
          title: isLocalScreenShared
            ? 'Discontinue screenshare to open the whiteboard!'
            : "Can't open whiteboard while screenshare is happening!",
        })
      );
    } else {
      hmsInstance.interactivityCenter
        .startWhiteboard('Interactive Session')
        .then((success) => {
          console.log('#startWhiteboard started whiteboard ', success);
        })
        .catch((error) => {
          console.log('#startWhiteboard error ', error);
        });
    }

    // Close the current bottom sheet
    closeRoomSettingsModal();
  };

  const canShowBRB = useHMSLayoutConfig(
    (layoutConfig) =>
      !!layoutConfig?.screens?.conferencing?.default?.elements?.brb
  );

  const canRaiseHand = useHMSConferencingScreenConfig(
    (confScreenConfig) => !!confScreenConfig?.elements?.hand_raise
  );

  const isOnStage = useHMSLayoutConfig((layoutConfig) => {
    return !!layoutConfig?.screens?.conferencing?.default?.elements
      ?.on_stage_exp;
  });

  const allowedToPublish = useSelector((state: RootState) => {
    const allowed = selectAllowedTracksToPublish(state);
    return (allowed && allowed.length > 0) ?? false;
  });

  const showHandRaiseIcon = canRaiseHand && !isOnStage && allowedToPublish;

  return (
    <View>
      <BottomSheet.Header
        dismissModal={closeRoomSettingsModal}
        heading="Options"
        headingTestID={TestIds.room_modal_heading}
        closeIconTestID={TestIds.room_modal_close_btn}
      />

      <BottomSheet.Divider />

      <View style={styles.contentContainer}>
        {groupIntoTriplets(
          [
            {
              id: 'participants',
              testID: TestIds.room_modal_participants_btn,
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
              testID: !!isLocalScreenShared
                ? TestIds.room_modal_stop_screen_share_btn
                : TestIds.room_modal_share_screen_btn,
              icon: <ScreenShareIcon style={{ width: 20, height: 20 }} />,
              label: isLocalScreenShared ? 'Sharing Screen' : 'Share Screen',
              pressHandler: handleScreenShareTogglePress,
              isActive: !!isLocalScreenShared, // Show active if screen is shared
              hide: !canPublishScreen, // Hide if can't publish screen
            },
            {
              id: 'brb',
              testID: isBRBOn
                ? TestIds.room_modal_stop_brb_btn
                : TestIds.room_modal_brb_btn,
              icon: <BRBIcon style={{ width: 20, height: 20 }} />,
              label: isBRBOn ? "I'm Back" : 'Be Right Back',
              pressHandler: toggleBRB,
              isActive: isBRBOn, // Show active if `isBRBOn` is set on metadata
              hide: !canShowBRB, // Hide if can't publish screen
            },
            {
              id: 'raise-hand',
              testID: isHandRaised
                ? TestIds.room_modal_hand_raised_btn
                : TestIds.room_modal_hand_raise_btn,
              icon: <HandIcon style={{ width: 20, height: 20 }} />,
              label: isHandRaised ? 'Hand Raised' : 'Raise Hand',
              pressHandler: toggleRaiseHand,
              isActive: isHandRaised, // Show active if `isHandRaised` is set on metadata
              hide: !showHandRaiseIcon, // Hide if can't publish screen
            },
            {
              id: 'recording',
              testID: isRecordingOn
                ? TestIds.room_modal_stop_recording_btn
                : TestIds.room_modal_start_recording_btn,
              icon: (
                <RecordingIcon
                  type={isRecordingPaused ? 'pause' : 'on'}
                  style={[
                    { width: 20, height: 20 },
                    isRecordingOn
                      ? { tintColor: alertErrorDefaultColor }
                      : null,
                  ]}
                />
              ),
              label: isRecordingOn
                ? 'Recording'
                : isRecordingPaused
                  ? 'Recording Paused'
                  : 'Record',
              pressHandler: handleRecordingTogglePress,
              isActive: false,
              disabled: isRecordingDisabled,
              hide: !canStartRecording, // Hide if can't publish screen
            },
            {
              id: 'change-name',
              testID: TestIds.room_modal_change_name_btn,
              icon: <PencilIcon style={{ width: 20, height: 20 }} />,
              label: 'Change Name',
              pressHandler: changeName,
              isActive: false,
              hide: isPublisher || editUsernameDisabled,
            },
            {
              id: 'polls-and-quizes',
              icon: <PollVoteIcon style={{ width: 20, height: 20 }} />,
              label: 'Polls and Quizzes',
              pressHandler: openPollsQuizzesModal,
              isActive: false,
              hide: !canReadOrWritePoll,
            },
            {
              id: 'whiteboard',
              icon: (
                <PencilIcon type="board" style={{ width: 20, height: 20 }} />
              ),
              label: whiteboard ? 'Close Whiteboard' : 'Open Whiteboard',
              pressHandler: toggleWhiteboard,
              isActive: !!whiteboard && whiteboard.isOwner,
              disabled: !!whiteboard && !whiteboard.isOwner,
              hide: !whiteboardAdminPermission,
            },
            {
              id: 'noise-cancellation',
              icon: <WaveIcon style={{ width: 20, height: 20 }} />,
              label: isNoiseCancellationEnabled
                ? 'Noise Reduced'
                : 'Reduce Noise',
              pressHandler: handleNoiseCancellation,
              isActive: isNoiseCancellationEnabled,
              hide: !showNoiseCancellationButton,
              disabled: isLocalAudioMuted,
            },
            {
              id: 'virtual-background',
              icon: <VirtualBackgroundIcon style={{ width: 20, height: 20 }} />,
              label: 'Virtual Background',
              pressHandler: handleVirtualBackground,
              isActive: virtualBackgroundApplied,
              hide: !videoPlugin || !canPublishVideo,
              disabled: isLocalVideoMuted,
            },
            {
              id: 'closed-captions',
              icon: <CCIcon style={{ width: 20, height: 20 }} />,
              label: isCCAdmin
                ? 'Closed Captions'
                : ccEnabledForSelf
                  ? 'Hide Captions'
                  : 'Show Captions',
              pressHandler: isCCAdmin ? handleCCForEveryone : handleCCForSelf,
              isActive: !isCCAdmin && ccEnabledForSelf,
              hide: !isCCAdmin && !ccEnabledForEveryone,
              disabled: false,
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
                              testID={item.testID}
                              icon={item.icon}
                              onPress={item.pressHandler}
                              text={item.label}
                              isActive={item.isActive}
                              disabled={item.disabled}
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
  disabled?: TouchableOpacityProps['disabled'];
  testID?: TouchableOpacityProps['testID'];
  isActive?: boolean | null;
};

const SettingItem: React.FC<SettingItemProps> = ({
  testID,
  text,
  icon,
  onPress,
  disabled,
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
      testID={testID}
      disabled={disabled}
      style={[
        styles.button,
        isActive ? hmsRoomStyles.button : null,
        disabled ? { opacity: 0.6 } : null,
      ]}
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
