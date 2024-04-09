import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HMSStatusBar } from './StatusBar';
import { HLSPlayerView } from './HLSPlayerView';
import { LeaveRoomBottomSheet } from './LeaveRoomBottomSheet';
import { PreviewForRoleChangeModal } from './PreviewForRoleChangeModal';
import { ChatAndParticipantsBottomSheet } from './ChatAndParticipants';
import { DefaultModal } from './DefaultModal';
import { ModalTypes, PipModes } from '../utils/types';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { ChangeAspectRatio } from './Modals';
import type { RootState } from '../redux';
import { HLSChatView } from './HLSChatView';
import { useIsLandscapeOrientation } from '../utils/dimension';

interface HLSViewerScreenContentProps {}

export const HLSViewerScreenContent: React.FC<
  HLSViewerScreenContentProps
> = ({}) => {
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );
  const isLandscapeOrientation = useIsLandscapeOrientation();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <HMSStatusBar barStyle={'light-content'} />

      <SafeAreaView
        style={[
          styles.container,
          hmsRoomStyles.container,
          isLandscapeOrientation ? styles.landscapeContainer : null,
        ]}
      >
        <HLSPlayerView />

        <HLSChatView />
      </SafeAreaView>

      {isPipModeActive ? null : (
        <>
          <LeaveRoomBottomSheet />

          <PreviewForRoleChangeModal />

          <ChatAndParticipantsBottomSheet />

          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.HLS_PLAYER_ASPECT_RATIO}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeAspectRatio
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  landscapeContainer: {
    flexDirection: 'row',
  },
});
