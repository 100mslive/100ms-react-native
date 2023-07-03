import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ModalTypes, PeerTrackNode, PipModes} from '../utils/types';
import type {RootState} from '../redux';
import {useRTCStatsListeners} from '../utils/hooks';
import {Footer} from './Footer';
import {DisplayView} from './DisplayView';
import {Header} from './Header';
import {COLORS} from '../utils/theme';
import {
  useFetchHMSRoles,
  useHMSMessages,
  useHMSPIPRoomLeave,
  useHMSRemovedFromRoomUpdate,
  useModalType,
  usePIPListener,
  useShowLandscapeLayout,
} from '../hooks-util';

interface MeetingProps {
  peerTrackNodes: Array<PeerTrackNode>;
}

export const Meeting: React.FC<MeetingProps> = ({peerTrackNodes}) => {
  const [modalVisible, handleModalVisible] = useModalType();
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );
  const showLandscapeLayout = useShowLandscapeLayout();

  // TODO: Fetch latest Room and localPeer on mount of this component?

  useFetchHMSRoles();

  useHMSMessages();

  useHMSRemovedFromRoomUpdate();

  // Handle when user press leave button visible on PIP Window
  useHMSPIPRoomLeave();

  // Handle state change to reset layout when App is focused from PIP Window
  usePIPListener();

  // Handle rendering RTC stats on Tiles and inside RTC stats modal
  useRTCStatsListeners(modalVisible === ModalTypes.RTC_STATS);

  return (
    <SafeAreaView
      edges={showLandscapeLayout ? ['left', 'right'] : undefined}
      style={[
        styles.container,
        showLandscapeLayout ? {flexDirection: 'row'} : null,
      ]}
    >
      {showLandscapeLayout ? <StatusBar hidden={true} /> : null}
      {isPipModeActive ? null : (
        <Header
          isLeaveMenuOpen={modalVisible === ModalTypes.LEAVE_MENU}
          setModalVisible={handleModalVisible}
        />
      )}
      <DisplayView
        peerTrackNodes={peerTrackNodes}
        modalVisible={modalVisible}
        setModalVisible={handleModalVisible}
      />
      {isPipModeActive ? null : (
        <Footer
          modalVisible={modalVisible}
          setModalVisible={handleModalVisible}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
});
