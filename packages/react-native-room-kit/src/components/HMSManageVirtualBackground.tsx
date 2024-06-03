import * as React from 'react';
import { useSelector } from 'react-redux';
import type { StyleProp, ViewStyle } from 'react-native';

import { VirtualBackgroundIcon } from '../Icons';
import { useCanPublishVideo } from '../hooks-sdk';
import type { RootState } from '../redux';
import { PressableIcon } from './PressableIcon';
import { useHMSRoomStyle, useModalType } from '../hooks-util';
import { VirtualBackgroundBottomSheet } from './VirtualBackgroundBottomSheet';
import { ModalTypes } from '../utils/types';

interface HMSManageVirtualBackgroundProps {
  style?: StyleProp<ViewStyle>;
}

export const HMSManageVirtualBackground: React.FC<
  HMSManageVirtualBackgroundProps
> = ({ style }) => {
  const canPublishVideo = useCanPublishVideo();
  const videoPluginExists = useSelector(
    (state: RootState) => !!state.hmsStates.videoPlugin
  );

  if (!canPublishVideo || !videoPluginExists) {
    return null;
  }

  return <VirtualBackgroundButton style={style} />;
};

interface VirtualBackgroundButtonProps {
  style?: StyleProp<ViewStyle>;
}

const VirtualBackgroundButton: React.FC<VirtualBackgroundButtonProps> = ({
  style,
}) => {
  const { handleModalVisibleType } = useModalType();
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );
  const videoPluginExists = useSelector(
    (state: RootState) => !!state.hmsStates.videoPlugin
  );

  const handleVideoMuteTogglePress = async () => {
    if (isLocalVideoMuted || !videoPluginExists) {
      return;
    }
    handleModalVisibleType(ModalTypes.VIRTUAL_BACKGROUND);
  };

  const cameraIconStyles = useHMSRoomStyle(
    (theme) => ({
      tintColor: isLocalVideoMuted
        ? theme.palette.on_surface_low
        : theme.palette.on_surface_high,
    }),
    [isLocalVideoMuted]
  );

  return (
    <React.Fragment>
      <PressableIcon
        onPress={handleVideoMuteTogglePress}
        disabled={isLocalVideoMuted}
        style={style}
      >
        <VirtualBackgroundIcon style={cameraIconStyles} />
      </PressableIcon>

      <VirtualBackgroundBottomSheet />
    </React.Fragment>
  );
};
