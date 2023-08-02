import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { AlertIcon, LeaveIcon } from '../Icons';
import { useLeaveMethods } from '../hooks-util';
import type { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { ModalTypes } from '../utils/types';
import { DefaultModal } from './DefaultModal';
import { EndRoomModal, LeaveRoomModal } from './Modals';
import { PressableIcon } from './PressableIcon';

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

  const [leavePopVisible, setLeavePopVisible] = React.useState(false);
  const [leaveModalType, setLeaveModalType] = React.useState(
    ModalTypes.DEFAULT
  );
  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom
  );

  /**
   * Opens the Leave Popup Menu
   */
  const handleLeaveButtonPress = () => {
    if (canEndRoom) {
      setLeavePopVisible(true);
    } else {
      setLeaveModalType(ModalTypes.LEAVE_ROOM);
    }
  };

  /**
   * Closes the Leave Popup Menu
   * Leave Modal will open after the popup is hidden
   */
  const handleLeavePress = () => {
    leavePopCloseAction.current = ModalTypes.LEAVE_ROOM;
    setLeavePopVisible(false);
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

  const { leave, endRoom } = useLeaveMethods();

  const leaveIconDelegate =
    'leaveIconDelegate' in props && props.leaveIconDelegate ? (
      props.leaveIconDelegate
    ) : (
      <LeaveIcon />
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
        style: styles.button,
      })}

      <LeavePopup
        isVisible={leavePopVisible}
        onEndSessionPress={handleEndSessionPress}
        onLeavePress={handleLeavePress}
        onPopupDismiss={dismissPopup}
        onPopupHide={handlePopupHide}
      />

      <DefaultModal
        modalPosiion="center"
        modalVisible={leaveModalType === ModalTypes.LEAVE_ROOM}
        setModalVisible={dismissModal}
      >
        <LeaveRoomModal onSuccess={leave} cancelModal={dismissModal} />
      </DefaultModal>

      <DefaultModal
        modalPosiion="center"
        modalVisible={leaveModalType === ModalTypes.END_ROOM}
        setModalVisible={dismissModal}
      >
        <EndRoomModal onSuccess={endRoom} cancelModal={dismissModal} />
      </DefaultModal>
    </View>
  );
};

const HEADER_CONTENT_HEIGHT = 24 + 8 + 8 + 2; // ICON_SIZE + TOP_PADDING + BOTTOM_PADDING + TOP&BOTTOM_BORDER_WIDTH
const HEADER_HEIGHT = 8 + HEADER_CONTENT_HEIGHT + 8; // TOP_HEADER_PADDING + HEADER_CONTENT_HEIGHT + BOTTOM_HEADER_PADDING

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.ALERT.ERROR.DEFAULT,
    borderColor: COLORS.ALERT.ERROR.DEFAULT,
  },
});

interface LeavePopupProps {
  isVisible: boolean;
  onPopupDismiss(): void;
  onLeavePress(): void;
  onEndSessionPress(): void;
  onPopupHide(): void;
}

const LeavePopup: React.FC<LeavePopupProps> = ({
  isVisible,
  onPopupDismiss,
  onLeavePress,
  onEndSessionPress,
  onPopupHide,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom
  );

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      backdropColor={COLORS.BACKGROUND.DIM}
      backdropOpacity={0}
      onBackButtonPress={onPopupDismiss}
      onBackdropPress={onPopupDismiss}
      useNativeDriver={true}
      onModalHide={onPopupHide}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      style={leavePopupStyles.modal}
    >
      <View
        style={[
          leavePopupStyles.leavePopupContent,
          {
            marginTop: safeAreaInsets.top + HEADER_HEIGHT,
            marginLeft: safeAreaInsets.left + 16 - 1, // LEFT_HEADER_PADDING - HEADER_BORDER_WIDTH,
            marginRight: safeAreaInsets.right,
            marginBottom: safeAreaInsets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={leavePopupStyles.leaveButton}
          onPress={onLeavePress}
        >
          <LeaveIcon style={leavePopupStyles.leaveButtonIcon} />
          <Text style={leavePopupStyles.leaveButtonText}>Leave Studio</Text>
        </TouchableOpacity>

        {canEndRoom ? (
          <>
            <View style={leavePopupStyles.divider} />

            <TouchableOpacity
              style={leavePopupStyles.endRoomButton}
              onPress={onEndSessionPress}
            >
              <AlertIcon style={leavePopupStyles.endRoomIcon} />
              <Text style={leavePopupStyles.endRoomText}>End Session</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </Modal>
  );
};

const leavePopupStyles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  leavePopupContent: {
    overflow: 'hidden',
    width: 243,
    backgroundColor: COLORS.SURFACE.DIM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER.BRIGHT,
  },
  leaveButton: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  leaveButtonIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
    transform: [{ rotateY: '180deg' }],
  },
  leaveButtonText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER.BRIGHT,
  },
  endRoomButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.ALERT.ERROR.DIM,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  endRoomIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
  },
  endRoomText: {
    color: COLORS.ALERT.ERROR.BRIGHT,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
});
