import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { LeaveIcon } from '../Icons';
import { useHMSRoomStyleSheet, useLeaveMethods, useModalType } from '../hooks-util';
import type { RootState } from '../redux';
import { BottomSheet } from './BottomSheet';
import { StopIcon } from '../Icons';
import { ModalTypes, OnLeaveReason } from '../utils/types';
import { TestIds } from '../utils/constants';

// const HEADER_CONTENT_HEIGHT = 24 + 8 + 8 + 2; // ICON_SIZE + TOP_PADDING + BOTTOM_PADDING + TOP&BOTTOM_BORDER_WIDTH
// const HEADER_HEIGHT = 8 + HEADER_CONTENT_HEIGHT + 8; // TOP_HEADER_PADDING + HEADER_CONTENT_HEIGHT + BOTTOM_HEADER_PADDING

interface LeaveRoomBottomSheetProps {}

export const LeaveRoomBottomSheet: React.FC<LeaveRoomBottomSheetProps> = () => {
  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom
  );
  const canStream = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.role?.permissions?.hlsStreaming
  );

  const isStreaming = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.hlsStreamingState?.running ?? false
  );

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

  const leavePopCloseAction = React.useRef(ModalTypes.DEFAULT);

  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const { leave } = useLeaveMethods();

  /**
   * Closes the Leave Popup Menu
   * No action is taken when the popup is hidden
   */
  const onPopupDismiss = () => {
    leavePopCloseAction.current = ModalTypes.DEFAULT;
    handleModalVisibleType(ModalTypes.DEFAULT);
  };

  /**
   * Closes the Leave Popup Menu
   * Leave Modal will open after the popup is hidden
   */
  const onLeavePress = async () => {
    leavePopCloseAction.current = ModalTypes.DEFAULT;
    handleModalVisibleType(ModalTypes.DEFAULT);
    await leave(OnLeaveReason.LEAVE);
  };

  /**
   * Closes the Leave Popup Menu
   * End Session Modal will open after the popup is hidden
   */
  const onEndSessionPress = async () => {
    leavePopCloseAction.current = ModalTypes.END_ROOM;
    handleModalVisibleType(ModalTypes.DEFAULT);
  };

  const onEndStreamPress = async () => {
    leavePopCloseAction.current = ModalTypes.END_ROOM;
    handleModalVisibleType(ModalTypes.DEFAULT);
  };

  /**
   * Handles action to take when the leave popup is hidden
   */
  const handlePopupHide = () => {
    if (leavePopCloseAction.current !== ModalTypes.DEFAULT) {
      handleModalVisibleType(leavePopCloseAction.current);
    }
  };

  return (
    <BottomSheet
      isVisible={modalVisibleType === ModalTypes.LEAVE_ROOM}
      containerStyle={styles.container}
      dismissModal={onPopupDismiss}
      onModalHide={handlePopupHide}
    >
      <View>
        <TouchableOpacity
          testID={TestIds.leave_cta}
          style={styles.button}
          onPress={onLeavePress}
        >
          <LeaveIcon style={styles.icon} />

          <View style={styles.textContainer}>
            <Text style={[styles.text, hmsRoomStyles.text]}>
              Leave
            </Text>
            <Text testID={TestIds.leave_description} style={[styles.subtext, hmsRoomStyles.subtext]}>
              Others will continue after you leave. You can join the session
              again.
            </Text>
          </View>
        </TouchableOpacity>

        {canStream && isStreaming ? (
          <TouchableOpacity
            testID={TestIds.end_stream_cta}
            style={[styles.button, hmsRoomStyles.endButton]}
            onPress={onEndStreamPress}
          >
            <StopIcon style={[styles.icon, hmsRoomStyles.endIcon]} />

            <View style={styles.textContainer}>
              <Text style={[styles.text, hmsRoomStyles.endText]}>
                End Stream
              </Text>
              <Text
                testID={TestIds.end_stream_description}
                style={[styles.subtext, hmsRoomStyles.endSubtext]}
              >
                The stream will end for everyone after they’ve watched it.
              </Text>
            </View>
          </TouchableOpacity>
        ) : canEndRoom ? (
          <TouchableOpacity
            testID={TestIds.end_session_cta}
            style={[styles.button, hmsRoomStyles.endButton]}
            onPress={onEndSessionPress}
          >
            <StopIcon style={[styles.icon, hmsRoomStyles.endIcon]} />

            <View style={styles.textContainer}>
              <Text style={[styles.text, hmsRoomStyles.endText]}>
                End Session
              </Text>
              <Text
                testID={TestIds.end_session_description}
                style={[styles.subtext, hmsRoomStyles.endSubtext]}
              >
                The session will end for everyone in the room immediately.
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
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
