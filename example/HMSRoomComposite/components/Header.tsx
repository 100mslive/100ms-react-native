import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';

import {COLORS} from '../utils/theme';
import {HMSManageLeave} from './HMSManageLeave';
import {HMSManageCameraRotation} from './HMSManageCameraRotation';

export const _Header = () => {
  return (
    <View style={styles.container}>
      <HMSManageLeave />
      <HMSManageCameraRotation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND.DIM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
});

export const Header = memo(_Header);

// export const _Header2 = ({
//   isLeaveMenuOpen,
//   setModalVisible,
// }: {
//   isLeaveMenuOpen: boolean;
//   setModalVisible(modalType: ModalTypes, delay?: any): void;
// }) => {
//   // hooks
//   const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
//   const room = useSelector((state: RootState) => state.hmsStates.room);
//   const localPeer = useSelector(
//     (state: RootState) => state.hmsStates.localPeer,
//   );
//   const roomCode = useSelector((state: RootState) => state.user.roomCode);
//   const isScreenShared = useSelector(
//     (state: RootState) => state.hmsStates.isLocalScreenShared,
//   );
//   const showLandscapeLayout = useShowLandscapeLayout();

//   // constants
//   const iconSize = 20;

//   // functions

//   return (
//     <View
//       style={[
//         styles.iconTopWrapper,
//         showLandscapeLayout ? styles.iconTopWrapperLandscape : null,
//       ]}
//     >
//       <View
//         style={[
//           styles.iconTopSubWrapper,
//           showLandscapeLayout ? styles.iconTopSubWrapperLandscape : null,
//         ]}
//       >
//         {room?.hlsStreamingState?.running ? (
//           <View>
//             <View style={styles.liveTextContainer}>
//               <View style={styles.liveStatus} />
//               <Text style={styles.liveTimeText}>Live</Text>
//             </View>
//             {Array.isArray(room?.hlsStreamingState?.variants) ? (
//               <RealTime
//                 startedAt={room?.hlsStreamingState?.variants[0]?.startedAt}
//               />
//             ) : null}
//           </View>
//         ) : (
//           <Text style={styles.headerName}>{roomCode}</Text>
//         )}
//       </View>
//       <View
//         style={[
//           styles.iconTopSubWrapper,
//           showLandscapeLayout ? styles.iconTopSubWrapperLandscape : null,
//         ]}
//       >
//         {(room?.browserRecordingState?.running ||
//           room?.hlsRecordingState?.running) && (
//           <MaterialCommunityIcons
//             name="record-circle-outline"
//             style={
//               showLandscapeLayout
//                 ? styles.roomStatusLandscape
//                 : styles.roomStatus
//             }
//             size={iconSize}
//           />
//         )}
//         {(room?.hlsStreamingState?.running ||
//           room?.rtmpHMSRtmpStreamingState?.running) && (
//           <Ionicons
//             name="globe-outline"
//             style={
//               showLandscapeLayout
//                 ? styles.roomStatusLandscape
//                 : styles.roomStatus
//             }
//             size={iconSize}
//           />
//         )}
//         {isScreenShared && (
//           <Feather
//             name="copy"
//             style={
//               showLandscapeLayout
//                 ? styles.roomStatusLandscape
//                 : styles.roomStatus
//             }
//             size={iconSize}
//           />
//         )}
//       </View>
//     </View>
//   );
// };
