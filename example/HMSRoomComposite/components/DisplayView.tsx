import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text, InteractionManager} from 'react-native';
import {HMSPeer, HMSTrack, HMSCameraControl} from '@100mslive/react-native-hms';

import {styles} from './styles';
import {DefaultModal} from './DefaultModal';
import {ModalTypes, PeerTrackNode, PipModes} from '../utils/types';
import {pairData, requestExternalStoragePermission} from '../utils/functions';
import {
  ChangeAspectRatio,
  ChangeNameModal,
  ChangeRoleAccepteModal,
  ChangeRoleModal,
  ChangeTrackStateModal,
  ChangeVolumeModal,
  ParticipantsModal,
  SaveScreenshot,
} from './Modals';
import type {RootState} from '../redux';
import {GridView} from './GridView';
import {HLSView} from './HLSView';
import PIPView from './PIPView';
import {PeerSettingsModalContent} from '../components/PeerSettingsModalContent';
import {StreamingQualityModalContent} from '../components/StreamingQualityModalContent';
import {
  useHMSChangeTrackStateRequest,
  useHMSInstance,
  useHMSRoleChangeRequest,
  useHMSSessionStoreListeners,
  useIsHLSViewer,
} from '../hooks-util';
import {useIsPortraitOrientation} from '../utils/dimension';

type CapturedImagePath = {uri: string} | null;

interface DisplayViewProps {
  modalVisible: ModalTypes;
  peerTrackNodes: Array<PeerTrackNode>;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  modalVisible,
  peerTrackNodes,
  setModalVisible,
}) => {
  // --- 100ms SDK Instance ---
  const hmsInstance = useHMSInstance();

  const dispatch = useDispatch();
  const isPortrait = useIsPortraitOrientation();
  const isHLSViewer = useIsHLSViewer();

  // --- Refs ---
  const gridViewRef = useRef<React.ElementRef<typeof GridView> | null>(null);
  const trackToChangeRef = useRef<null | HMSTrack>(null);

  //  --- Redux stores ---
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );
  const spotlightTrackId = useSelector(
    (state: RootState) => state.user.spotlightTrackId,
  ); // State to track active spotlight trackId

  // --- Component Local States ---
  const [updatePeer, setUpdatePeer] = useState<HMSPeer>();
  const [selectedPeerTrackNode, setSelectedPeerTrackNode] =
    useState<PeerTrackNode | null>(null);
  const [capturedImagePath, setCapturedImagePath] =
    useState<CapturedImagePath>(null);

  // --- Constants ---
  const pairedPeers = useMemo(
    () => pairData(peerTrackNodes, isPortrait ? 4 : 2, spotlightTrackId),
    [peerTrackNodes, spotlightTrackId, isPortrait],
  );

  // --- Listeners ---
  useHMSSessionStoreListeners();

  const trackStateChangeRequest = useHMSChangeTrackStateRequest(() => {
    setModalVisible(ModalTypes.CHANGE_TRACK, true);
  });

  const roleChangeRequest = useHMSRoleChangeRequest(() => {
    setModalVisible(ModalTypes.CHANGE_ROLE_ACCEPT, true);
  });

  // --- Effects ---
  useEffect(() => {
    // Scroll to start of the list
    if (spotlightTrackId) {
      gridViewRef.current
        ?.getFlatlistRef()
        .current?.scrollToOffset({animated: true, offset: 0});
    }
  }, [spotlightTrackId]);

  // functions

  const onChangeNamePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    setModalVisible(ModalTypes.CHANGE_NAME, true);
  };

  const handlePeerTileMorePress = React.useCallback(
    (peerTrackNode: PeerTrackNode) => {
      setSelectedPeerTrackNode(peerTrackNode);
      setModalVisible(ModalTypes.PEER_SETTINGS);
    },
    [setModalVisible],
  );

  const onChangeRolePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    setModalVisible(ModalTypes.CHANGE_ROLE, true);
  };

  const onSetVolumePress = (peer: HMSPeer) => {
    setUpdatePeer(peer);
    setModalVisible(ModalTypes.VOLUME, true);
  };

  const handleCaptureScreenShotPress = (node: PeerTrackNode) => {
    setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(() => {
      gridViewRef.current?.captureViewScreenshot(node);
    });
  };

  const handleCaptureImageAtMaxSupportedResolutionPress = (
    _node: PeerTrackNode,
  ) => {
    setModalVisible(ModalTypes.DEFAULT);
    InteractionManager.runAfterInteractions(async () => {
      const permission = await requestExternalStoragePermission();

      if (hmsInstance && permission) {
        HMSCameraControl.captureImageAtMaxSupportedResolution(true)
          .then((imagePath: string) => {
            console.log(
              'captureImageAtMaxSupportedResolution result -> ',
              imagePath,
            );
            setModalVisible(ModalTypes.DEFAULT);
            setCapturedImagePath({uri: `file://${imagePath}`});
          })
          .catch((error: any) => {
            console.warn(
              'captureImageAtMaxSupportedResolution error -> ',
              error,
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
    <View style={styles.container}>
      {isHLSViewer ? (
        <HLSView />
      ) : pairedPeers.length > 0 ? (
        <>
          {isPipModeActive ? (
            <PIPView pairedPeers={pairedPeers} />
          ) : (
            <GridView
              ref={gridViewRef}
              onPeerTileMorePress={handlePeerTileMorePress}
              pairedPeers={pairedPeers}
            />
          )}
        </>
      ) : (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeHeading}>Welcome!</Text>
          <Text style={styles.welcomeDescription}>
            You're the first one here.
          </Text>
          <Text style={styles.welcomeDescription}>
            Sit back and relax till the others join.
          </Text>
        </View>
      )}

      {isPipModeActive ? null : (
        <>
          <DefaultModal
            backdrop={true}
            modalPosiion="center"
            viewStyle={{minWidth: '70%', width: undefined}}
            modalVisible={modalVisible === ModalTypes.PEER_SETTINGS}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            {selectedPeerTrackNode ? (
              <PeerSettingsModalContent
                peerTrackNode={selectedPeerTrackNode}
                cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
                onChangeNamePress={onChangeNamePress}
                onChangeRolePress={onChangeRolePress}
                onSetVolumePress={onSetVolumePress}
                onCaptureScreenShotPress={handleCaptureScreenShotPress}
                onCaptureImageAtMaxSupportedResolutionPress={
                  handleCaptureImageAtMaxSupportedResolutionPress
                }
                onStreamingQualityPress={handleStreamingQualityPress}
              />
            ) : null}
          </DefaultModal>

          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.HLS_PLAYER_ASPECT_RATIO}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeAspectRatio
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
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
            modalVisible={modalVisible === ModalTypes.CHANGE_ROLE_ACCEPT}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            {roleChangeRequest ? (
              <ChangeRoleAccepteModal
                instance={hmsInstance}
                roleChangeRequest={roleChangeRequest}
                cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
              />
            ) : null}
          </DefaultModal>
          <DefaultModal
            animationIn={'slideInUp'}
            animationOut={'slideOutDown'}
            modalVisible={modalVisible === ModalTypes.PARTICIPANTS}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ParticipantsModal
              instance={hmsInstance}
              changeName={onChangeNamePress}
              changeRole={onChangeRolePress}
              setVolume={onSetVolumePress}
            />
          </DefaultModal>
          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.CHANGE_ROLE}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeRoleModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.VOLUME}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeVolumeModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.CHANGE_NAME}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChangeNameModal
              instance={hmsInstance}
              peer={updatePeer}
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
        </>
      )}
    </View>
  );
};
