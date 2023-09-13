import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { PressableIcon } from '../PressableIcon';
import { MaximizeIcon, MinimizeIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';
import { hexToRgbA } from '../../utils/theme';
import type { PeerTrackNode } from '../../utils/types';
import type { RootState } from '../../redux';
import { setFullScreenPeerTrackNode } from '../../redux/actions';

export interface HMSFullScreenButtonProps {
  peerTrackNode: PeerTrackNode;
}

export const HMSFullScreenButton: React.FC<HMSFullScreenButtonProps> = ({
  peerTrackNode,
}) => {
  const dispatch = useDispatch();
  const fullScreenPeerTrackNode = useSelector(
    (state: RootState) => state.app.fullScreenPeerTrackNode
  );

  const buttonStyles = useHMSRoomStyle((theme) => ({
    backgroundColor:
      theme.palette.background_dim &&
      hexToRgbA(theme.palette.background_dim, 0.64),
  }));

  const maximizeAction =
    !fullScreenPeerTrackNode || fullScreenPeerTrackNode.id !== peerTrackNode.id;

  const handleFullScreenPress = () => {
    dispatch(setFullScreenPeerTrackNode(maximizeAction ? peerTrackNode : null));
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
