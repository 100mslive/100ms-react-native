import React, {memo} from 'react';
import {View, Text, InteractionManager} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

import {styles} from './styles';
import {CustomButton} from './CustomButton';
import {Menu, MenuItem} from './MenuModal';
import {ModalTypes} from '../utils/types';
import {parseMetadata} from '../utils/functions';
import {RealTime} from './Modals';
import type {RootState} from '../redux';
import {useShowLandscapeLayout} from '../hooks-util';

export const _Header = ({
  isLeaveMenuOpen,
  setModalVisible,
}: {
  isLeaveMenuOpen: boolean;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}) => {
  // hooks
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const room = useSelector((state: RootState) => state.hmsStates.room);
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer,
  );
  const roomCode = useSelector((state: RootState) => state.user.roomCode);
  const isScreenShared = useSelector(
    (state: RootState) => state.hmsStates.isLocalScreenShared,
  );
  const showLandscapeLayout = useShowLandscapeLayout();

  // constants
  const iconSize = 20;
  const parsedMetadata = parseMetadata(localPeer?.metadata);

  // functions
  const onRaiseHandPress = async () => {
    await hmsInstance
      ?.changeMetadata(
        JSON.stringify({
          ...parsedMetadata,
          isHandRaised: !parsedMetadata?.isHandRaised,
          isBRBOn: false,
        }),
      )
      .then(d => console.log('Change Metadata Success: ', d))
      .catch(e => console.log('Change Metadata Error: ', e));
  };

  const onSwitchCameraPress = () => {
    localPeer?.localVideoTrack()?.switchCamera();
  };

  const onParticipantsPress = () => {
    InteractionManager.runAfterInteractions(() => {
      setModalVisible(ModalTypes.PARTICIPANTS);
    });
  };

  return (
    <View
      style={[
        styles.iconTopWrapper,
        showLandscapeLayout ? styles.iconTopWrapperLandscape : null,
      ]}
    >
      <View
        style={[
          styles.iconTopSubWrapper,
          showLandscapeLayout ? styles.iconTopSubWrapperLandscape : null,
        ]}
      >
        <Menu
          visible={isLeaveMenuOpen}
          anchor={
            <CustomButton
              onPress={() => {
                setModalVisible(ModalTypes.LEAVE_MENU);
              }}
              viewStyle={[
                styles.iconContainer,
                styles.leaveIcon,
                showLandscapeLayout ? styles.iconContainerLandscape : null,
              ]}
              LeftIcon={
                <Feather name="log-out" style={styles.icon} size={iconSize} />
              }
            />
          }
          onRequestClose={() => setModalVisible(ModalTypes.DEFAULT)}
          style={styles.participantsMenuContainer}
        >
          <MenuItem
            onPress={() => setModalVisible(ModalTypes.LEAVE_ROOM, true)}
          >
            <View style={styles.participantMenuItem}>
              <Feather
                name="log-out"
                style={styles.participantMenuItemIcon}
                size={iconSize}
              />
              <Text style={styles.participantMenuItemName}>Leave Studio</Text>
            </View>
          </MenuItem>
          {localPeer?.role?.permissions?.endRoom && (
            <MenuItem
              onPress={() => setModalVisible(ModalTypes.END_ROOM, true)}
            >
              <View style={styles.participantMenuItem}>
                <Feather
                  name="alert-triangle"
                  style={[styles.participantMenuItemIcon, styles.error]}
                  size={iconSize}
                />
                <Text style={[styles.participantMenuItemName, styles.error]}>
                  End Session
                </Text>
              </View>
            </MenuItem>
          )}
        </Menu>
        {room?.hlsStreamingState?.running ? (
          <View>
            <View style={styles.liveTextContainer}>
              <View style={styles.liveStatus} />
              <Text style={styles.liveTimeText}>Live</Text>
            </View>
            {Array.isArray(room?.hlsStreamingState?.variants) ? (
              <RealTime
                startedAt={room?.hlsStreamingState?.variants[0]?.startedAt}
              />
            ) : null}
          </View>
        ) : (
          <Text style={styles.headerName}>{roomCode}</Text>
        )}
      </View>
      <View
        style={[
          styles.iconTopSubWrapper,
          showLandscapeLayout ? styles.iconTopSubWrapperLandscape : null,
        ]}
      >
        {(room?.browserRecordingState?.running ||
          room?.hlsRecordingState?.running) && (
          <MaterialCommunityIcons
            name="record-circle-outline"
            style={
              showLandscapeLayout
                ? styles.roomStatusLandscape
                : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        {(room?.hlsStreamingState?.running ||
          room?.rtmpHMSRtmpStreamingState?.running) && (
          <Ionicons
            name="globe-outline"
            style={
              showLandscapeLayout
                ? styles.roomStatusLandscape
                : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        {isScreenShared && (
          <Feather
            name="copy"
            style={
              showLandscapeLayout
                ? styles.roomStatusLandscape
                : styles.roomStatus
            }
            size={iconSize}
          />
        )}
        <CustomButton
          onPress={onParticipantsPress}
          viewStyle={[
            styles.iconContainer,
            showLandscapeLayout ? styles.iconContainerLandscape : null,
          ]}
          LeftIcon={
            <Ionicons name="people" style={styles.icon} size={iconSize} />
          }
        />
        <CustomButton
          onPress={onRaiseHandPress}
          viewStyle={[
            styles.iconContainer,
            showLandscapeLayout ? styles.iconContainerLandscape : null,
            parsedMetadata?.isHandRaised && styles.iconMuted,
          ]}
          LeftIcon={
            <Ionicons
              name="hand-left-outline"
              style={[
                styles.icon,
                parsedMetadata?.isHandRaised && styles.handRaised,
              ]}
              size={iconSize}
            />
          }
        />
        <CustomButton
          onPress={() => {
            InteractionManager.runAfterInteractions(() => {
              setModalVisible(ModalTypes.CHAT);
            });
            // setNotification(false);
          }}
          viewStyle={[
            styles.iconContainer,
            showLandscapeLayout ? styles.iconContainerLandscape : null,
          ]}
          LeftIcon={
            <View>
              {/* {notification && <View style={styles.messageDot} />} */}
              <MaterialCommunityIcons
                name="message-outline"
                style={styles.icon}
                size={iconSize}
              />
            </View>
          }
        />
        {localPeer?.role?.publishSettings?.allowed?.includes('video') && (
          <CustomButton
            onPress={onSwitchCameraPress}
            viewStyle={styles.iconContainer}
            LeftIcon={
              <Ionicons
                name="camera-reverse-outline"
                style={styles.icon}
                size={iconSize}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export const Header = memo(_Header);
