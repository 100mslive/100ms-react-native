import {HMSLocalPeer, HMSRoom} from '@100mslive/react-native-hms';
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  Platform,
  AppState,
  LayoutAnimation,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {ModalTypes, PipModes} from '../utils/types';
import type {RootState} from '../redux';
import {changePipModeStatus} from '../redux/actions';
import {useRTCStatsListeners} from '../utils/hooks';
import {Footer} from './Footer';
import {DisplayView} from './DisplayView';
import {Header} from './Header';
import {COLORS} from '../utils/theme';

export const Meeting = () => {
  // hooks
  const dispatch = useDispatch();
  const modalTaskRef = useRef<any>(null);
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );

  // useState hook
  const [room, setRoom] = useState<HMSRoom>();
  const [localPeer, setLocalPeer] = useState<HMSLocalPeer>();
  const [isAudioMute, setIsAudioMute] = useState<boolean | undefined>(
    localPeer?.audioTrack?.isMute(),
  );
  const [isVideoMute, setIsVideoMute] = useState<boolean | undefined>(
    localPeer?.videoTrack?.isMute(),
  );
  const [isScreenShared, setIsScreenShared] = useState<boolean | undefined>(
    localPeer?.auxiliaryTracks && localPeer?.auxiliaryTracks?.length > 0,
  );
  const [modalVisible, setModalVisible] = useState<ModalTypes>(
    ModalTypes.DEFAULT,
  );

  const handleModalVisible = React.useCallback(
    (modalType: ModalTypes, delay = false) => {
      if (delay) {
        setModalVisible(ModalTypes.DEFAULT);

        const task = () => {
          setModalVisible(modalType);
          modalTaskRef.current = null;
        };

        if (Platform.OS === 'android') {
          modalTaskRef.current = InteractionManager.runAfterInteractions(task);
        } else {
          modalTaskRef.current = setTimeout(task, 500);
        }
      } else {
        setModalVisible(modalType);
      }
    },
    [],
  );

  const updateLocalPeer = () => {
    hmsInstance?.getLocalPeer().then(peer => {
      setLocalPeer(peer);
    });
  };

  const updateRoom = () => {
    hmsInstance?.getRoom().then(hmsRoom => {
      setRoom(hmsRoom);
    });
  };

  useEffect(() => {
    setIsVideoMute(localPeer?.videoTrack?.isMute());
    setIsAudioMute(localPeer?.audioTrack?.isMute());
  }, [localPeer]);

  useEffect(() => {
    updateLocalPeer();
    updateRoom();

    return () => {
      if (Platform.OS === 'android') {
        modalTaskRef.current?.cancel();
      } else {
        clearTimeout(modalTaskRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPipModeActive) {
      const appStateListener = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };

      AppState.addEventListener('focus', appStateListener);

      return () => {
        AppState.removeEventListener('focus', appStateListener);
        dispatch(changePipModeStatus(PipModes.INACTIVE));
      };
    }
  }, [isPipModeActive]);

  useRTCStatsListeners(modalVisible === ModalTypes.RTC_STATS);

  return (
    <SafeAreaView style={styles.container}>
      {isPipModeActive ? null : (
        <Header
          modalVisible={modalVisible}
          setModalVisible={handleModalVisible}
          room={room}
          localPeer={localPeer}
          isScreenShared={isScreenShared}
        />
      )}
      <DisplayView
        room={room}
        localPeer={localPeer}
        modalVisible={modalVisible}
        setModalVisible={handleModalVisible}
        setRoom={setRoom}
        setLocalPeer={setLocalPeer}
        setIsAudioMute={setIsAudioMute}
        setIsVideoMute={setIsVideoMute}
        setIsScreenShared={setIsScreenShared}
      />
      {isPipModeActive ? null : (
        <Footer
          isHlsStreaming={room?.hlsStreamingState?.running}
          isBrowserRecording={room?.browserRecordingState?.running}
          isHlsRecording={room?.hlsRecordingState?.running}
          isRtmpStreaming={room?.rtmpHMSRtmpStreamingState?.running}
          localPeer={localPeer}
          modalVisible={modalVisible}
          isAudioMute={isAudioMute}
          isVideoMute={isVideoMute}
          isScreenShared={isScreenShared}
          setModalVisible={handleModalVisible}
          setIsAudioMute={setIsAudioMute}
          setIsVideoMute={setIsVideoMute}
          setIsScreenShared={setIsScreenShared}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
  },
});
