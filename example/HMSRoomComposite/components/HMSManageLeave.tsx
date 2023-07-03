import {useNavigation} from '@react-navigation/native';
import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';

import {AlertIcon, LeaveIcon} from '../Icons';
import {useHMSInstance, useSafeDimensions} from '../hooks-util';
import {RootState} from '../redux';
import {clearStore} from '../redux/actions';
import {COLORS} from '../utils/theme';
import {ModalTypes} from '../utils/types';
import {DefaultModal} from './DefaultModal';
import {EndRoomModal, LeaveRoomModal} from './Modals';
import {PressableIcon} from './PressableIcon';

export const HMSManageLeave = () => {
  // TODO: read current meeting joined state
  const isMeetingJoined = true;

  if (!isMeetingJoined) {
    return null;
  }

  return <LeaveButton />;
};

const LeaveButton = () => {
  // TODO: What if useNavigation context is undefined?
  const navigation = useNavigation();
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const {safeWidth, safeHeight} = useSafeDimensions();
  const [leavePopVisible, setLeavePopVisible] = React.useState(false);
  const [leaveModalType, setLeaveModalType] = React.useState(
    ModalTypes.DEFAULT,
  );
  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom,
  );

  const handleLeaveButtonPress = () => setLeavePopVisible(true);

  const handleLeavePress = () => {
    setLeavePopVisible(false);
    setLeaveModalType(ModalTypes.LEAVE_ROOM);
  };

  const handleEndSessionPress = async () => {
    setLeavePopVisible(false);
    setLeaveModalType(ModalTypes.END_ROOM);
  };

  const dismissPopup = () => setLeavePopVisible(false);

  const dismissModal = () => setLeaveModalType(ModalTypes.DEFAULT);

  const destroy = () => {
    hmsInstance
      .destroy()
      .then(s => {
        console.log('Destroy Success: ', s);
        // TODOS:
        // - If show `Meeting_Ended` is true, show Meeting screen by setting state to MEETING_ENDED
        //    - Reset Redux States
        //    - HMSInstance will not be available now
        //    - When your presses "Re Join" Action button, restart process from root component
        //    - When your presses "Done" Action button
        //        - If we have callback fn, call it
        //        - Otherwise try our best to navigate away from current screen
        //
        // - No screen to show
        //    - No need to reset redux state?
        //    - HMSInstance will be available till this point
        //    - If we have callback fn, call it
        //    - Otherwise try our best to navigate away from current screen
        //    - When we are navigated away from screen, HMSInstance will be not available

        // dispatch(clearMessageData());
        // dispatch(clearPeerData());
        // dispatch(clearHmsReference());

        // if (navigation.canGoBack()) {
        //   navigation.goBack();
        // } else {
        // TODO: remove this later
        navigation.navigate('QRCodeScreen' as never);
        dispatch(clearStore());
        // }
      })
      .catch(e => {
        console.log(`Destroy HMS instance Error: ${e}`);
        Toast.showWithGravity(
          `Destroy HMS instance Error: ${e}`,
          Toast.LONG,
          Toast.TOP,
        );
      });
  };

  const onLeavePress = () => {
    hmsInstance
      .leave()
      .then(d => {
        console.log('Leave Success: ', d);
        destroy();
      })
      .catch(e => {
        console.log(`Leave Room Error: ${e}`);
        Toast.showWithGravity(`Leave Room Error: ${e}`, Toast.LONG, Toast.TOP);
      });
  };

  const onEndRoomPress = () => {
    hmsInstance
      .endRoom('Host ended the room')
      .then(d => {
        console.log('EndRoom Success: ', d);
        destroy();
      })
      .catch(e => console.log('EndRoom Error: ', e));
  };

  return (
    <View style={styles.container}>
      <PressableIcon onPress={handleLeaveButtonPress} style={styles.button}>
        <LeaveIcon />
      </PressableIcon>

      {leavePopVisible ? (
        <Pressable
          style={[
            styles.leavePopupBackdrop,
            {
              width: safeWidth,
              height: safeHeight,
            },
          ]}
          onPress={dismissPopup}
        >
          <View style={styles.leavePopupContent}>
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeavePress}
            >
              <LeaveIcon style={styles.leaveButtonIcon} />
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>

            {canEndRoom ? (
              <>
                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.endRoomButton}
                  onPress={handleEndSessionPress}
                >
                  <AlertIcon style={styles.endRoomIcon} />
                  <Text style={styles.endRoomText}>End Session</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </Pressable>
      ) : null}

      <DefaultModal
        modalPosiion="center"
        modalVisible={leaveModalType === ModalTypes.LEAVE_ROOM}
        setModalVisible={dismissModal}
      >
        <LeaveRoomModal onSuccess={onLeavePress} cancelModal={dismissModal} />
      </DefaultModal>

      <DefaultModal
        modalPosiion="center"
        modalVisible={leaveModalType === ModalTypes.END_ROOM}
        setModalVisible={dismissModal}
      >
        <EndRoomModal onSuccess={onEndRoomPress} cancelModal={dismissModal} />
      </DefaultModal>
    </View>
  );
};

const HEADER_HEIGHT = 24 + 8 + 8 + 2; // ICON_SIZE + TOP_PADDING + BOTTOM_PADDINg + TOP&BOTTOM_BORDER_WIDTH

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 2,
  },
  button: {
    backgroundColor: COLORS.ALERT.ERROR.DEFAULT,
    borderColor: COLORS.ALERT.ERROR.DEFAULT,
  },
  leavePopupBackdrop: {
    position: 'absolute',
    top: -8, // TOP_HEADER_PADDING
    left: -16, // LEFT_HEADER_PADDING
  },
  leavePopupContent: {
    position: 'absolute',
    top: 8 + HEADER_HEIGHT + 8, // TOP_HEADER_PADDING + HEADER_HEIGHT + EXTRA_OFFSET
    left: 16 - 1, // LEFT_HEADER_PADDING - HEADER_BORDER_WIDTH
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
    transform: [{rotateY: '180deg'}],
  },
  leaveButtonText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
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
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 20,
  },
});
