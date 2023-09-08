import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { HMSLocalPeer, HMSRemotePeer } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import { HandIcon } from '../../Icons';
import { ParticipantsItemOption } from './ParticipantsItemOption';

interface ParticipantsItemOptionsProps {
  peer: HMSLocalPeer | HMSRemotePeer;
}

const _ParticipantsItemOptions: React.FC<ParticipantsItemOptionsProps> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    divider: {
      backgroundColor: theme.palette.border_bright,
    },
  }));

  const handleBringOnStagePress = () => {};

  const handleLowerHandPress = () => {};

  const handleRemoveParticipantPress = () => {};

  return (
    <>
      {[
        {
          id: 'bring-on-stage',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Bring on Stage',
          pressHandler: handleBringOnStagePress,
          isActive: false,
          hide: false,
        },
        {
          id: 'lower-hand',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Lower Hand',
          pressHandler: handleLowerHandPress,
          isActive: false,
          hide: false,
        },
        {
          id: 'remove-participant',
          icon: <HandIcon style={{ width: 20, height: 20 }} />,
          label: 'Remove Participant',
          pressHandler: handleRemoveParticipantPress,
          isActive: false,
          hide: false,
        },
      ].map((item, idx) => {
        const isFirst = idx === 0;

        return (
          <React.Fragment key={item.id}>
            {isFirst ? null : (
              <View style={[styles.divider, hmsRoomStyles.divider]} />
            )}

            <ParticipantsItemOption
              label={item.label}
              onPress={item.pressHandler}
              icon={item.icon}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});

export const ParticipantsItemOptions = React.memo(_ParticipantsItemOptions);

// const hmsInstance = useHMSInstance();
// const dispatch = useDispatch();
// const localPeerPermissions = useSelector(
//   (state: RootState) => state.hmsStates.localPeer?.role?.permissions
// );
// const debugMode = useSelector((state: RootState) => state.user.debugMode);
// const { handleModalVisibleType: setModalVisible } = useModalType();
//
// const [visible, setVisible] = React.useState(-1);
//
// const hideMenu = () => setVisible(-1);
// const showMenu = (index: number) => setVisible(index);
//
// const removePeer = (peer: HMSPeer) => {
//   hideMenu();
//   hmsInstance
//     ?.removePeer(peer, 'removed from room')
//     .then((d) => console.log('Remove Peer Success: ', d))
//     .catch((e) => {
//       console.log('Remove Peer Error: ', e);
//       Toast.showWithGravity((e as Error).message, Toast.LONG, Toast.TOP);
//     });
// };
// const onChangeNamePress = (peer: HMSPeer) => {
//   hideMenu();
//   setTimeout(() => {
//     batch(() => {
//       dispatch(setPeerToUpdate(peer));
//       setModalVisible(ModalTypes.CHANGE_NAME, true);
//     });
//   }, 500);
// };
// const onChangeRolePress = (peer: HMSPeer) => {
//   hideMenu();
//   setTimeout(() => {
//     batch(() => {
//       dispatch(setPeerToUpdate(peer));
//       setModalVisible(ModalTypes.CHANGE_ROLE, true);
//     });
//   }, 500);
// };
// const toggleAudio = (peer: HMSPeer) => {
//   hideMenu();
//   if (peer?.audioTrack) {
//     hmsInstance
//       ?.changeTrackState(peer?.audioTrack, !peer?.audioTrack?.isMute())
//       .then((d) => console.log('Toggle Audio Success: ', d))
//       .catch((e) => console.log('Toggle Audio Error: ', e));
//   }
// };
// const toggleVideo = (peer: HMSPeer) => {
//   hideMenu();
//   if (peer?.videoTrack) {
//     hmsInstance
//       ?.changeTrackState(peer?.videoTrack, !peer?.videoTrack?.isMute())
//       .then((d) => console.log('Toggle Video Success: ', d))
//       .catch((e) => console.log('Toggle Video Error: ', e));
//   }
// };
// return (
//   <FlatList
//     data={data}
//     initialNumToRender={2}
//     maxToRenderPerBatch={3}
//     keyboardShouldPersistTaps="always"
//     windowSize={11}
//     renderItem={({ item, index }) => {
//       const peer = item;
//       return (
//         <View style={styles.participantItem} key={peer.peerID}>
//           <View style={styles.participantAvatar}>
//             <Text style={styles.participantAvatarText}>
//               {getInitials(peer.name)}
//             </Text>
//           </View>
//           <View style={styles.participantDescription}>
//             <Text style={styles.participantName} numberOfLines={1}>
//               {peer.name}
//             </Text>
//             <Text style={styles.participantRole} numberOfLines={1}>
//               {peer.role?.name}
//             </Text>
//           </View>
//           <Menu
//             visible={visible === index}
//             anchor={
//               <CustomButton
//                 onPress={() => showMenu(index)}
//                 viewStyle={styles.participantSettings}
//                 LeftIcon={
//                   <MaterialCommunityIcons
//                     name="dots-vertical"
//                     style={styles.icon}
//                     size={28}
//                   />
//                 }
//               />
//             }
//             onRequestClose={hideMenu}
//             style={styles.participantsMenuContainer}
//           >
//             {peer.isLocal === false && localPeerPermissions?.removeOthers && (
//               <MenuItem onPress={() => removePeer(peer)}>
//                 <View style={styles.participantMenuItem}>
//                   <MaterialCommunityIcons
//                     name="account-remove-outline"
//                     style={[styles.participantMenuItemIcon, styles.error]}
//                     size={24}
//                   />
//                   <Text
//                     style={[styles.participantMenuItemName, styles.error]}
//                   >
//                     Remove Peer
//                   </Text>
//                 </View>
//               </MenuItem>
//             )}
//             {peer.isLocal && (
//               <MenuItem onPress={() => onChangeNamePress(peer)}>
//                 <View style={styles.participantMenuItem}>
//                   <Ionicons
//                     name="person-outline"
//                     style={styles.participantMenuItemIcon}
//                     size={24}
//                   />
//                   <Text style={styles.participantMenuItemName}>
//                     Change Name
//                   </Text>
//                 </View>
//               </MenuItem>
//             )}
//             {debugMode && localPeerPermissions?.changeRole ? (
//               <MenuItem onPress={() => onChangeRolePress(peer)}>
//                 <View style={styles.participantMenuItem}>
//                   <Ionicons
//                     name="people-outline"
//                     style={styles.participantMenuItemIcon}
//                     size={24}
//                   />
//                   <Text style={styles.participantMenuItemName}>
//                     Change Role
//                   </Text>
//                 </View>
//               </MenuItem>
//             ) : null}
//             {peer.isLocal === false &&
//             !!peer.audioTrack &&
//             peer.role?.publishSettings?.allowed?.includes('audio') ? (
//               <MenuItem onPress={() => toggleAudio(peer)}>
//                 <View style={styles.participantMenuItem}>
//                   <Feather
//                     name={
//                       peer.audioTrack?.isMute() === false ? 'mic' : 'mic-off'
//                     }
//                     style={styles.participantMenuItemIcon}
//                     size={24}
//                   />
//                   <Text style={styles.participantMenuItemName}>
//                     {peer.audioTrack?.isMute() === false
//                       ? 'Mute audio'
//                       : 'Unmute audio'}
//                   </Text>
//                 </View>
//               </MenuItem>
//             ) : null}
//             {peer.isLocal === false &&
//             !!peer.videoTrack &&
//             peer.role?.publishSettings?.allowed?.includes('video') ? (
//               <MenuItem onPress={() => toggleVideo(peer)}>
//                 <View style={styles.participantMenuItem}>
//                   <Feather
//                     name={
//                       peer.videoTrack?.isMute() === false
//                         ? 'video'
//                         : 'video-off'
//                     }
//                     style={styles.participantMenuItemIcon}
//                     size={24}
//                   />
//                   <Text style={styles.participantMenuItemName}>
//                     {peer.videoTrack?.isMute() === false
//                       ? 'Mute video'
//                       : 'Unmute video'}
//                   </Text>
//                 </View>
//               </MenuItem>
//             ) : null}
//           </Menu>
//         </View>
//       );
//     }}
//     keyExtractor={(item) => item.peerID}
//   />
// );
