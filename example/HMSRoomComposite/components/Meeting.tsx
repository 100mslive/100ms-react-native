import React, {useCallback, useState} from 'react';
import {StyleSheet, StatusBar, Pressable} from 'react-native';
import {useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const offset = useSharedValue(1);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [modalVisible, handleModalVisible] = useModalType();
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE,
  );
  const showLandscapeLayout = useShowLandscapeLayout();

  const toggleControls = useCallback(() => {
    'worklet';
    cancelAnimation(offset);
    offset.value = withTiming(
      offset.value === 1 ? 0 : 1,
      {duration: 200, easing: Easing.ease},
      (finished, current) => {
        if (finished) {
          runOnJS(setControlsHidden)(current === 0);
        }
      },
    );
  }, []);

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
      <Pressable onPress={toggleControls} style={styles.pressableContainer}>
        <StatusBar hidden={controlsHidden || showLandscapeLayout} />

        {isPipModeActive ? null : <Header offset={offset} />}
        <DisplayView
          offset={offset}
          peerTrackNodes={peerTrackNodes}
          modalVisible={modalVisible}
          setModalVisible={handleModalVisible}
        />
        {isPipModeActive ? null : (
          <Footer
            offset={offset}
            modalVisible={modalVisible}
            setModalVisible={handleModalVisible}
          />
        )}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
  pressableContainer: {
    flex: 1,
  },
});
