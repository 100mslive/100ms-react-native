import * as React from 'react';
import { View, Text, FlatList, StyleSheet, Platform } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  HMSLocalPeer,
  HMSPeer,
  HMSRemotePeer,
} from '@100mslive/react-native-hms';

import { CustomButton } from '../CustomButton';
import { Menu, MenuItem } from '../MenuModal';
import { getInitials } from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import type { RootState } from '../../redux';
import { useHMSInstance, useModalType } from '../../hooks-util';
import { setPeerToUpdate } from '../../redux/actions';
import { ModalTypes } from '../../utils/types';

export type ParticipantsListProps = {
  data: (HMSLocalPeer | HMSRemotePeer)[];
};

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ data }) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const localPeerPermissions = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions
  );
  const { handleModalVisibleType: setModalVisible } = useModalType();

  const [visible, setVisible] = React.useState(-1);

  const hideMenu = () => setVisible(-1);
  const showMenu = (index: number) => setVisible(index);

  const removePeer = (peer: HMSPeer) => {
    hideMenu();
    hmsInstance
      ?.removePeer(peer, 'removed from room')
      .then((d) => console.log('Remove Peer Success: ', d))
      .catch((e) => {
        console.log('Remove Peer Error: ', e);
        Toast.showWithGravity((e as Error).message, Toast.LONG, Toast.TOP);
      });
  };

  const onChangeNamePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      batch(() => {
        dispatch(setPeerToUpdate(peer));
        setModalVisible(ModalTypes.CHANGE_NAME, true);
      });
    }, 500);
  };

  const onChangeRolePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      batch(() => {
        dispatch(setPeerToUpdate(peer));
        setModalVisible(ModalTypes.CHANGE_ROLE, true);
      });
    }, 500);
  };

  const toggleAudio = (peer: HMSPeer) => {
    hideMenu();
    if (peer?.audioTrack) {
      hmsInstance
        ?.changeTrackState(peer?.audioTrack, !peer?.audioTrack?.isMute())
        .then((d) => console.log('Toggle Audio Success: ', d))
        .catch((e) => console.log('Toggle Audio Error: ', e));
    }
  };

  const toggleVideo = (peer: HMSPeer) => {
    hideMenu();
    if (peer?.videoTrack) {
      hmsInstance
        ?.changeTrackState(peer?.videoTrack, !peer?.videoTrack?.isMute())
        .then((d) => console.log('Toggle Video Success: ', d))
        .catch((e) => console.log('Toggle Video Error: ', e));
    }
  };

  const onSetVolumePress = (peer: HMSPeer) => {
    hideMenu();
    setTimeout(() => {
      batch(() => {
        dispatch(setPeerToUpdate(peer));
        setModalVisible(ModalTypes.VOLUME, true);
      });
    }, 500);
  };

  return (
    <FlatList
      data={data}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      keyboardShouldPersistTaps="always"
      windowSize={11}
      renderItem={({ item, index }) => {
        const peer = item;
        return (
          <View style={styles.participantItem} key={peer.peerID}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantAvatarText}>
                {getInitials(peer.name)}
              </Text>
            </View>
            <View style={styles.participantDescription}>
              <Text style={styles.participantName} numberOfLines={1}>
                {peer.name}
                {peer.isLocal && ' (You)'}
              </Text>
              <Text style={styles.participantRole} numberOfLines={1}>
                {peer.role?.name}
              </Text>
            </View>
            <Menu
              visible={visible === index}
              anchor={
                <CustomButton
                  onPress={() => showMenu(index)}
                  viewStyle={styles.participantSettings}
                  LeftIcon={
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      style={styles.icon}
                      size={28}
                    />
                  }
                />
              }
              onRequestClose={hideMenu}
              style={styles.participantsMenuContainer}
            >
              {peer.isLocal === false && localPeerPermissions?.removeOthers && (
                <MenuItem onPress={() => removePeer(peer)}>
                  <View style={styles.participantMenuItem}>
                    <MaterialCommunityIcons
                      name="account-remove-outline"
                      style={[styles.participantMenuItemIcon, styles.error]}
                      size={24}
                    />
                    <Text
                      style={[styles.participantMenuItemName, styles.error]}
                    >
                      Remove Peer
                    </Text>
                  </View>
                </MenuItem>
              )}
              {peer.isLocal && (
                <MenuItem onPress={() => onChangeNamePress(peer)}>
                  <View style={styles.participantMenuItem}>
                    <Ionicons
                      name="person-outline"
                      style={styles.participantMenuItemIcon}
                      size={24}
                    />
                    <Text style={styles.participantMenuItemName}>
                      Change Name
                    </Text>
                  </View>
                </MenuItem>
              )}
              {localPeerPermissions?.changeRole && (
                <MenuItem onPress={() => onChangeRolePress(peer)}>
                  <View style={styles.participantMenuItem}>
                    <Ionicons
                      name="people-outline"
                      style={styles.participantMenuItemIcon}
                      size={24}
                    />
                    <Text style={styles.participantMenuItemName}>
                      Change Role
                    </Text>
                  </View>
                </MenuItem>
              )}
              {peer.isLocal === false &&
              !!peer.audioTrack &&
              peer.role?.publishSettings?.allowed?.includes('audio') ? (
                <MenuItem onPress={() => toggleAudio(peer)}>
                  <View style={styles.participantMenuItem}>
                    <Feather
                      name={
                        peer.audioTrack?.isMute() === false ? 'mic' : 'mic-off'
                      }
                      style={styles.participantMenuItemIcon}
                      size={24}
                    />
                    <Text style={styles.participantMenuItemName}>
                      {peer.audioTrack?.isMute() === false
                        ? 'Mute audio'
                        : 'Unmute audio'}
                    </Text>
                  </View>
                </MenuItem>
              ) : null}
              {peer.isLocal === false &&
              !!peer.videoTrack &&
              peer.role?.publishSettings?.allowed?.includes('video') ? (
                <MenuItem onPress={() => toggleVideo(peer)}>
                  <View style={styles.participantMenuItem}>
                    <Feather
                      name={
                        peer.videoTrack?.isMute() === false
                          ? 'video'
                          : 'video-off'
                      }
                      style={styles.participantMenuItemIcon}
                      size={24}
                    />
                    <Text style={styles.participantMenuItemName}>
                      {peer.videoTrack?.isMute() === false
                        ? 'Mute video'
                        : 'Unmute video'}
                    </Text>
                  </View>
                </MenuItem>
              ) : null}
              {peer.isLocal === false && !!peer.audioTrack ? (
                <MenuItem onPress={() => onSetVolumePress(peer)}>
                  <View style={styles.participantMenuItem}>
                    <Ionicons
                      name="volume-high-outline"
                      style={styles.participantMenuItemIcon}
                      size={24}
                    />
                    <Text style={styles.participantMenuItemName}>
                      Set Volume
                    </Text>
                  </View>
                </MenuItem>
              ) : null}
            </Menu>
          </View>
        );
      }}
      keyExtractor={(item) => item.peerID}
    />
  );
};

const styles = StyleSheet.create({
  participantItem: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  participantAvatar: {
    height: 32,
    width: 32,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontFamily: 'Inter-Medium',
  },
  participantDescription: {
    flex: 1,
    flexDirection: 'column',
  },
  participantName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  participantRole: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  participantSettings: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 6,
  },
  icon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  participantsMenuContainer: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  participantMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
  },
  participantMenuItemIcon: {
    color: COLORS.WHITE,
    paddingRight: 16,
    height: 24,
  },
  participantMenuItemName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  error: {
    color: COLORS.INDICATORS.ERROR,
  },
});
