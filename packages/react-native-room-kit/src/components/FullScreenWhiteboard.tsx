import * as React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootState } from '../redux';
import { useHMSRoomColorPalette, useHMSRoomStyle } from '../hooks-util';
import { setFullScreenWhiteboard } from '../redux/actions';
import { Whiteboard } from './Whiteboard';

export const FullScreenWhiteboard = () => {
  const dispatch = useDispatch();
  const fullScreenWhiteboard = useSelector(
    (state: RootState) => state.app.fullScreenWhiteboard
  );

  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  const contentContainerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  const handleClosingFullScreenView = () => {
    dispatch(setFullScreenWhiteboard(false));
  };

  return (
    <Modal
      isVisible={fullScreenWhiteboard}
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
      <SafeAreaView style={[contentContainerStyles, styles.container]}>
        <Whiteboard />
      </SafeAreaView>
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
});
