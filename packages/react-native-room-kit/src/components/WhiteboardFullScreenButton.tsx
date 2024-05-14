import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { PressableIcon } from './PressableIcon';
import { MaximizeIcon, MinimizeIcon } from '../Icons';
import { useHMSRoomStyle } from '../hooks-util';
import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import { setFullScreenWhiteboard } from '../redux/actions';

export interface WhiteboardFullScreenButtonProps {}

export const WhiteboardFullScreenButton: React.FC<
  WhiteboardFullScreenButtonProps
> = () => {
  const dispatch = useDispatch();
  const fullScreenWhiteboard = useSelector(
    (state: RootState) => state.app.fullScreenWhiteboard
  );

  const buttonStyles = useHMSRoomStyle((theme) => ({
    backgroundColor:
      theme.palette.background_dim &&
      hexToRgbA(theme.palette.background_dim, 0.64),
  }));

  const maximizeAction = !fullScreenWhiteboard;

  const handleFullScreenPress = () => {
    dispatch(setFullScreenWhiteboard(!fullScreenWhiteboard));
  };

  return (
    <PressableIcon
      border={false}
      onPress={handleFullScreenPress}
      style={[styles.container, buttonStyles]}
    >
      {maximizeAction ? <MaximizeIcon /> : <MinimizeIcon />}
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
});
