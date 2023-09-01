import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { JoinForm_JoinBtnType } from '@100mslive/types-prebuilt/elements/join_form';

import { EndIcon, LeaveIcon } from '../Icons';
import {
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useLeaveMethods,
} from '../hooks-util';
import type { RootState } from '../redux';
import { ModalTypes } from '../utils/types';
import { PressableIcon } from './PressableIcon';
import { BottomSheet } from './BottomSheet';
import { StopIcon } from '../Icons';
import { EndRoomModalContent } from './EndRoomModalContent';

export const HMSManageLeave: React.FC<LeaveButtonProps> = (props) => {
  // TODO: read current meeting joined state
  const isMeetingJoined = true;

  if (!isMeetingJoined) {
    return null;
  }

  return <LeaveButton {...props} />;
};

type LeaveButtonProps =
  | {
      leaveIconDelegate?: React.ReactComponentElement<any>;
    }
  | {
      leaveButtonDelegate?: React.ReactComponentElement<any>;
    };

const LeaveButton: React.FC<LeaveButtonProps> = (props) => {
  const leavePopCloseAction = React.useRef(ModalTypes.DEFAULT);
  const isHLSViewer = useIsHLSViewer();
  const [leavePopVisible, setLeavePopVisible] = React.useState(false);
  const [leaveModalType, setLeaveModalType] = React.useState(
    ModalTypes.DEFAULT
  );

  const { leave } = useLeaveMethods();

  /**
   * Opens the Leave Popup Menu
   */
  const handleLeaveButtonPress = () => {
    setLeavePopVisible(true);
  };

  /**
   * Closes the Leave Popup Menu
   * Leave Modal will open after the popup is hidden
   */
  const handleLeavePress = () => {
    setLeavePopVisible(false);
    leave();
  };

  /**
   * Closes the Leave Popup Menu
   * End Session Modal will open after the popup is hidden
   */
  const handleEndSessionPress = async () => {
    leavePopCloseAction.current = ModalTypes.END_ROOM;
    setLeavePopVisible(false);
  };

  /**
   * Closes the Leave Popup Menu
   * No action is taken when the popup is hidden
   */
  const dismissPopup = () => {
    leavePopCloseAction.current = ModalTypes.DEFAULT;
    setLeavePopVisible(false);
  };

  /**
   * Handles action to take when the leave popup is hidden
   */
  const handlePopupHide = () => {
    setLeaveModalType(leavePopCloseAction.current);
  };

  const dismissModal = () => setLeaveModalType(ModalTypes.DEFAULT);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    button: {
      backgroundColor: theme.palette.alert_error_default,
      borderColor: theme.palette.alert_error_default,
    },
    icon: {
      tintColor: theme.palette.alert_error_brighter,
    },
  }));

  const leaveIconDelegate =
    'leaveIconDelegate' in props && props.leaveIconDelegate ? (
      props.leaveIconDelegate
    ) : isHLSViewer ? (
      <LeaveIcon style={hmsRoomStyles.icon} />
    ) : (
      <EndIcon style={hmsRoomStyles.icon} />
    );

  const leaveButtonDelegate =
    'leaveButtonDelegate' in props && props.leaveButtonDelegate ? (
      props.leaveButtonDelegate
    ) : (
      <PressableIcon>{React.cloneElement(leaveIconDelegate)}</PressableIcon>
    );

  return (
    <View>
      {React.cloneElement(leaveButtonDelegate, {
        onPress: handleLeaveButtonPress,
        style: hmsRoomStyles.button,
      })}

      <LeaveBottomSheet
        isVisible={leavePopVisible}
        onEndSessionPress={handleEndSessionPress}
        onLeavePress={handleLeavePress}
        onPopupDismiss={dismissPopup}
        onPopupHide={handlePopupHide}
      />

      <BottomSheet
        dismissModal={dismissModal}
        isVisible={leaveModalType === ModalTypes.END_ROOM}
        animationOutTiming={700}
      >
        <EndRoomModalContent dismissModal={dismissModal} />
      </BottomSheet>
    </View>
  );
};

// const HEADER_CONTENT_HEIGHT = 24 + 8 + 8 + 2; // ICON_SIZE + TOP_PADDING + BOTTOM_PADDING + TOP&BOTTOM_BORDER_WIDTH
// const HEADER_HEIGHT = 8 + HEADER_CONTENT_HEIGHT + 8; // TOP_HEADER_PADDING + HEADER_CONTENT_HEIGHT + BOTTOM_HEADER_PADDING

interface LeaveBottomSheetProps {
  isVisible: boolean;
  onPopupDismiss(): void;
  onLeavePress(): void;
  onEndSessionPress(): void;
  onPopupHide(): void;
}

const LeaveBottomSheet: React.FC<LeaveBottomSheetProps> = ({
  isVisible,
  onPopupDismiss,
  onLeavePress,
  onEndSessionPress,
  onPopupHide,
}) => {
  const joinAndGoLiveBtnType = useHMSLayoutConfig((layoutConfig) => {
    return (
      layoutConfig?.screens?.preview?.default?.elements?.join_form
        ?.join_btn_type === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_AND_GO_LIVE
    );
  });
  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom
  );
  const isStreaming = useSelector(
    (state: RootState) => state.hmsStates.room?.hlsStreamingState.running
  );
  const isRecording = useSelector(
    (state: RootState) => state.hmsStates.room?.browserRecordingState.running
  );

  const showEndButton = joinAndGoLiveBtnType && canEndRoom && (isStreaming || isRecording);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    subtext: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-Regular`,
    },
    endButton: {
      backgroundColor: theme.palette.alert_error_dim,
    },
    endText: {
      color: theme.palette.alert_error_brighter,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    endSubtext: {
      color: theme.palette.alert_error_bright,
      fontFamily: `${typography.font_family}-Regular`,
    },
    endIcon: {
      tintColor: theme.palette.alert_error_brighter,
    },
  }));

  return (
    <BottomSheet
      isVisible={isVisible}
      containerStyle={leavePopupStyles.container}
      dismissModal={onPopupDismiss}
      onModalHide={onPopupHide}
      animationOutTiming={700}
    >
      <View>
        <TouchableOpacity
          style={leavePopupStyles.button}
          onPress={onLeavePress}
        >
          <LeaveIcon style={leavePopupStyles.icon} />

          <View style={leavePopupStyles.textContainer}>
            <Text style={[leavePopupStyles.text, hmsRoomStyles.text]}>
              Leave
            </Text>
            <Text style={[leavePopupStyles.subtext, hmsRoomStyles.subtext]}>
              Others will continue after you leave. You can join the session
              again.
            </Text>
          </View>
        </TouchableOpacity>

        {showEndButton ? (
          <TouchableOpacity
            style={[leavePopupStyles.button, hmsRoomStyles.endButton]}
            onPress={onEndSessionPress}
          >
            <StopIcon style={[leavePopupStyles.icon, hmsRoomStyles.endIcon]} />

            <View style={leavePopupStyles.textContainer}>
              <Text style={[leavePopupStyles.text, hmsRoomStyles.endText]}>
                {isStreaming ? 'End Stream' : 'End Session'}
              </Text>
              <Text
                style={[leavePopupStyles.subtext, hmsRoomStyles.endSubtext]}
              >
                The {isStreaming ? 'stream' : 'recording'} & session will end for everyone. You can't undo this
                action.
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </BottomSheet>
  );
};

const leavePopupStyles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  button: {
    flexDirection: 'row',
    padding: 24,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginTop: 4,
  },
});
