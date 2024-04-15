import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  // CCIcon,
  CloseIcon,
  MaximizeIcon,
  MinimizeIcon,
} from '../Icons';
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';
import type { RootState } from '../redux';
import { setHlsFullScreen } from '../redux/actions';

export const _HLSPlayerControls: React.FC = () => {
  // const isHLSStreaming = useIsHLSStreamingOn();
  // const isStreamUrlPresent = useSelector(
  //   (state: RootState) =>
  //     !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  // );
  const dispatch = useDispatch();
  const hlsFullScreen = useSelector(
    (state: RootState) => state.app.hlsFullScreen
  );
  const { handleModalVisibleType } = useModalType();

  const handleCloseBtnPress = () => {
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  // const handleCCBtnPress = () => {
  //   //
  // };

  const toggleFullScreen = () => {
    dispatch(setHlsFullScreen(!hlsFullScreen));
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handleCloseBtnPress} style={styles.icon}>
          <CloseIcon size="medium" />
        </TouchableOpacity>

        {/* <View style={[styles.normalRow, styles.gap]}>
          <TouchableOpacity
            onPress={handleCCBtnPress}
            style={[styles.icon, styles.gap]}
          >
            <CCIcon size="medium" enabled={true} />
          </TouchableOpacity>
        </View> */}
      </View>

      <View style={styles.controlsRow}>
        <View />

        <View style={[styles.normalRow, styles.gap]}>
          <TouchableOpacity onPress={toggleFullScreen} style={styles.icon}>
            {hlsFullScreen ? (
              <MinimizeIcon size="medium" />
            ) : (
              <MaximizeIcon size="medium" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const HLSPlayerControls = React.memo(_HLSPlayerControls);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
    justifyContent: 'space-between',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  normalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  gap: {
    marginLeft: 16,
  },
});
