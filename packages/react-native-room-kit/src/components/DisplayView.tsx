import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { InteractionManager, View } from 'react-native';
import { HMSTrack, HMSCameraControl } from '@100mslive/react-native-hms';
import type { SharedValue } from 'react-native-reanimated';

import { DefaultModal } from './DefaultModal';
import { ModalTypes, PipModes } from '../utils/types';
import type { PeerTrackNode } from '../utils/types';
import { requestExternalStoragePermission } from '../utils/functions';
import {
  ChangeRoleModal,
  ChangeTrackStateModal,
  SaveScreenshot,
} from './Modals';
import type { RootState } from '../redux';
import { GridView } from './GridView';
import { PeerSettingsModalContent } from '../components/PeerSettingsModalContent';
import { StreamingQualityModalContent } from '../components/StreamingQualityModalContent';
import {
  useHMSChangeTrackStateRequest,
  useHMSInstance,
  useHMSRoleChangeRequest,
  useHMSSessionStoreListeners,
  useModalType,
} from '../hooks-util';
import { WebrtcView } from './WebrtcView';
import { BottomSheet } from './BottomSheet';
import { FullScreenVideoView } from './FullScreenVideoView';
import { PreviewForRoleChangeModal } from './PreviewForRoleChangeModal';
import { ChatAndParticipantsBottomSheet } from './ChatAndParticipants';
import { LeaveRoomBottomSheet } from './LeaveRoomBottomSheet';
import { EndRoomModal } from './EndRoomModal';
import { FullScreenWhiteboard } from './FullScreenWhiteboard';

type CapturedImagePath = { uri: string } | null;

interface DisplayViewProps {
  offset: SharedValue<number>;
  peerTrackNodes: Array<PeerTrackNode>;
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  offset,
  peerTrackNodes,
}) => {
  // --- 100ms SDK Instance ---
  const hmsInstance = useHMSInstance();

  const {
    modalVisibleType: modalVisible,
    handleModalVisibleType: setModalVisible,
  } = useModalType();

  // --- Refs ---
  const gridViewRef = useRef<React.ElementRef<typeof GridView> | null>(null);
  const trackToChangeRef = useRef<null | HMSTrack>(null);

  //  --- Redux stores ---
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );

  // --- Component Local States ---
  const [selectedPeerTrackNode, setSelectedPeerTrackNode] =
    useState<PeerTrackNode | null>(null);
  const [capturedImagePath, setCapturedImagePath] =
    useState<CapturedImagePath>(null);

  // --- Listeners ---
  useHMSSessionStoreListeners(gridViewRef);

  const trackStateChangeRequest = useHMSChangeTrackStateRequest(() => {
    setModalVisible(ModalTypes.CHANGE_TRACK, true);
  });

  useHMSRoleChangeRequest();

  // functions

  const handlePeerTileMorePress = React.useCallback(
    (peerTrackNode: PeerTrackNode) => {
      setSelectedPeerTrackNode(peerTrackNode);
      setModalVisible(ModalTypes.PEER_SETTINGS);
    },
    [setModalVisible]
  );

  const handleCaptureScreenShotPress = (node: PeerTrackNode) => {
    setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(() => {
      gridViewRef.current?.captureViewScreenshot(node);
    });
  };

  const handleCaptureImageAtMaxSupportedResolutionPress = (
    _node: PeerTrackNode
  ) => {
    setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(async () => {
      const permission = await requestExternalStoragePermission();

      if (hmsInstance && permission) {
        HMSCameraControl.captureImageAtMaxSupportedResolution(true)
          .then((imagePath: string) => {
            console.log(
              'captureImageAtMaxSupportedResolution result -> ',
              imagePath
            );
            setModalVisible(ModalTypes.DEFAULT);
            setCapturedImagePath({ uri: `file://${imagePath}` });
          })
          .catch((error: any) => {
            console.warn(
              'captureImageAtMaxSupportedResolution error -> ',
              error
            );
          });
      }
    });
  };

  const handleStreamingQualityPress = (track: HMSTrack) => {
    trackToChangeRef.current = track;
    setModalVisible(ModalTypes.STREAMING_QUALITY_SETTING, true);
  };

  return (
    <View style={{ flex: 1 }}>
      <WebrtcView
        ref={gridViewRef}
        offset={offset}
        peerTrackNodes={peerTrackNodes}
        handlePeerTileMorePress={handlePeerTileMorePress}
      />

      {isPipModeActive ? null : (
        <>
          <LeaveRoomBottomSheet />

          <EndRoomModal />

          <PreviewForRoleChangeModal />

          <FullScreenVideoView />

          <FullScreenWhiteboard />

          <ChatAndParticipantsBottomSheet />

          <BottomSheet
            isVisible={modalVisible === ModalTypes.PEER_SETTINGS}
            dismissModal={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            {selectedPeerTrackNode ? (
              <PeerSettingsModalContent
                peerTrackNode={selectedPeerTrackNode}
                peerTrackNodesListEmpty={peerTrackNodes.length === 0}
                cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
                onCaptureScreenShotPress={handleCaptureScreenShotPress}
                onCaptureImageAtMaxSupportedResolutionPress={
                  handleCaptureImageAtMaxSupportedResolutionPress
                }
                onStreamingQualityPress={handleStreamingQualityPress}
              />
            ) : null}
          </BottomSheet>

          {/* Save Image Captured from Local Camera */}
          <DefaultModal
            modalPosiion="center"
            modalVisible={!!capturedImagePath}
            setModalVisible={() => setCapturedImagePath(null)}
          >
            {capturedImagePath ? (
              <SaveScreenshot
                imageSource={capturedImagePath}
                cancelModal={() => setCapturedImagePath(null)}
              />
            ) : null}
          </DefaultModal>

          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.STREAMING_QUALITY_SETTING}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            {trackToChangeRef.current ? (
              <StreamingQualityModalContent
                track={trackToChangeRef.current}
                cancelModal={() => {
                  setModalVisible(ModalTypes.DEFAULT);
                }}
              />
            ) : null}
          </DefaultModal>

          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.CHANGE_TRACK}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            {trackStateChangeRequest ? (
              <ChangeTrackStateModal
                roleChangeRequest={trackStateChangeRequest}
                cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
              />
            ) : null}
          </DefaultModal>

          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.CHANGE_ROLE}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeRoleModal
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
        </>
      )}
    </View>
  );
};
