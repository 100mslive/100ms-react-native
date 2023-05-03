import React from 'react';
import {View, Text} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {
  HMSLocalPeer,
  HMSLocalVideoTrack,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';

import {styles} from '../styles';

import {CustomButton} from '../../../components';
import {ModalTypes} from '../../../utils/types';
import type {RootState} from '../../../redux';

interface HeaderProps {
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
}

export const Header: React.FC<HeaderProps> = ({setModalVisible}) => {
  const localPeer = useSelector((state: RootState) => state.user.hmsLocalPeer);
  const roomCode = useSelector((state: RootState) => state.user.roomCode);

  /**
   * User (i.e. Local Peer) can switch between front and back cameras if available
   * and has permission to show Video.
   * For More info about Local Peer {@link HMSLocalPeer} and switchCamera method {@link HMSLocalVideoTrack#switchCamera}
   */
  const onSwitchCameraPress = () => {
    localPeer?.localVideoTrack()?.switchCamera();
  };

  const showLeaveMeetingModal = () => setModalVisible(ModalTypes.LEAVE_ROOM);

  return (
    <View style={styles.iconTopWrapper}>
      <View style={styles.iconTopSubWrapper}>
        <CustomButton
          onPress={showLeaveMeetingModal}
          viewStyle={[styles.iconContainer, styles.leaveIcon]}
          LeftIcon={<Feather name="log-out" style={styles.icon} size={20} />}
        />

        <Text style={styles.headerName}>{roomCode}</Text>
      </View>

      <View style={styles.iconTopSubWrapper}>
        {/**
         * If User (i.e. Local Peer) has permission to show Video, then we can show Switch camera button to user.
         * User's allowed permissions are decided by the current `Role` of user
         * For more info about Roles and Permissions, checkout {@link https://www.100ms.live/docs/react-native/v2/foundation/templates-and-roles#roles | Roles}
         */}
        {localPeer?.role?.publishSettings?.allowed?.includes('video') ? (
          <CustomButton
            onPress={onSwitchCameraPress}
            viewStyle={styles.iconContainer}
            LeftIcon={
              <Ionicons
                name="camera-reverse-outline"
                style={styles.icon}
                size={24}
              />
            }
          />
        ) : null}
      </View>
    </View>
  );
};
