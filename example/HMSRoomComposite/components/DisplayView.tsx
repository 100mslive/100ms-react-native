import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {View, Text, InteractionManager} from 'react-native';
import {HMSPeer, HMSTrack, HMSCameraControl} from '@100mslive/react-native-hms';
import Toast from 'react-native-simple-toast';

import {styles} from './styles';
import {ChatWindow} from './ChatWindow';
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
  EndRoomModal,
  LeaveRoomModal,
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
import {clearStore} from '../redux/actions';

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
  // TODO: What if this is undefined?
  const navigation = useNavigation();

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
            modalVisible={modalVisible === ModalTypes.LEAVE_ROOM}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <LeaveRoomModal
              onSuccess={onLeavePress}
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            modalPosiion="center"
            modalVisible={modalVisible === ModalTypes.END_ROOM}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <EndRoomModal
              onSuccess={onEndRoomPress}
              cancelModal={() => setModalVisible(ModalTypes.DEFAULT)}
            />
          </DefaultModal>
          <DefaultModal
            animationIn={'slideInUp'}
            animationOut={'slideOutDown'}
            modalVisible={modalVisible === ModalTypes.CHAT}
            setModalVisible={() => setModalVisible(ModalTypes.DEFAULT)}
          >
            <ChatWindow />
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
