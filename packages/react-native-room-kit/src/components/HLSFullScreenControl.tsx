import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { MaximizeIcon, MinimizeIcon } from '../Icons';
import type { RootState } from '../redux';
import { setHlsFullScreen } from '../redux/actions';

interface HLSFullScreenControlProps {}

export const _HLSFullScreenControl: React.FC<
  HLSFullScreenControlProps
> = () => {
  const dispatch = useDispatch();
  const hlsFullScreen = useSelector(
    (state: RootState) => state.app.hlsFullScreen
  );
  const toggleFullScreen = () => {
    dispatch(setHlsFullScreen(!hlsFullScreen));
  };

  return (
    <TouchableOpacity onPress={toggleFullScreen} style={styles.icon}>
      {hlsFullScreen ? (
        <MinimizeIcon size="medium" />
      ) : (
        <MaximizeIcon size="medium" />
      )}
    </TouchableOpacity>
  );
};

export const HLSFullScreenControl = React.memo(_HLSFullScreenControl);

const styles = StyleSheet.create({
  icon: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
