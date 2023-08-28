import * as React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import type { RootState } from '../redux';
import { useHMSRoomColorPalette, useHMSRoomStyle } from '../hooks-util';
import { setFullScreenPeerTrackNode } from '../redux/actions';
import { HMSFullScreenButton } from './PeerVideoTile/HMSFullScreenButton';
import { PeerVideoTileView } from './PeerVideoTile/PeerVideoTileView';

export const FullScreenVideoView = () => {
  const dispatch = useDispatch();
  const fullScreenPeerTrackNode = useSelector(
    (state: RootState) => state.app.fullScreenPeerTrackNode
  );

  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  const contentContainerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  const handleClosingFullScreenView = () => {
    dispatch(setFullScreenPeerTrackNode(null));
  };

  return (
    <Modal
      isVisible={fullScreenPeerTrackNode !== null}
      animationIn={'fadeInUp'}
      animationInTiming={100}
      animationOutTiming={100}
      animationOut={'fadeOutDown'}
      backdropColor={backgroundDimColor}
      backdropOpacity={0.3}
      onBackButtonPress={handleClosingFullScreenView}
      onBackdropPress={handleClosingFullScreenView}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      style={styles.modal}
      supportedOrientations={['portrait', 'landscape']}
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={[styles.contentContainer, contentContainerStyles]}>
            {fullScreenPeerTrackNode &&
            fullScreenPeerTrackNode.track?.trackId ? (
              <PeerVideoTileView
                peerTrackNode={fullScreenPeerTrackNode}
                zoomIn={true}
              />
            ) : null}

            <HMSFullScreenButton peerTrackNode={fullScreenPeerTrackNode!} />
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
});
