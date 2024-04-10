import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import {
  // CCIcon,
  CloseIcon,
} from '../Icons';
import { ModalTypes } from '../utils/types';
import { useModalType } from '../hooks-util';

export const _HLSPlayerControls: React.FC = () => {
  // const isHLSStreaming = useIsHLSStreamingOn();
  // const isStreamUrlPresent = useSelector(
  //   (state: RootState) =>
  //     !!state.hmsStates.room?.hlsStreamingState.variants?.[0]?.hlsStreamUrl
  // );

  const { handleModalVisibleType } = useModalType();

  const handleCloseBtnPress = () => {
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  // const handleCCBtnPress = () => {
  //   //
  // };

  return (
    <View style={styles.container}>
      <View style={styles.topControlsRow}>
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
      {/* <View style={styles.topControlsRow}>
        <TouchableOpacity onPress={handleCloseBtnPress} style={styles.icon}>
          <CloseIcon size="medium" />
        </TouchableOpacity>
      </View> */}
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
  },
  topControlsRow: {
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
