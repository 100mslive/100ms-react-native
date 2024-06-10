import * as React from 'react';
import { useSelector } from 'react-redux';
import type { StyleProp, ViewStyle } from 'react-native';

import { RotateCameraIcon } from '../Icons';
import { useCanPublishVideo, useHMSActions } from '../hooks-sdk';
import type { RootState } from '../redux';
import { PressableIcon } from './PressableIcon';
import { useHMSRoomStyle } from '../hooks-util';
import { TestIds } from '../utils/constants';

interface HMSManageCameraRotationProps extends RotateCameraButtonProps {}

export const HMSManageCameraRotation: React.FC<
  HMSManageCameraRotationProps
> = ({ style }) => {
  const canPublishVideo = useCanPublishVideo();

  if (!canPublishVideo) {
    return null;
  }

  return <RotateCameraButton style={style} />;
};

interface RotateCameraButtonProps {
  style?: StyleProp<ViewStyle>;
}

const RotateCameraButton: React.FC<RotateCameraButtonProps> = ({ style }) => {
  const hmsActions = useHMSActions();
  // TODO: set initial `isLocalVideoMuted` state value as per initial track setting
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  const handleVideoMuteTogglePress = async () => {
    if (isLocalVideoMuted) {
      return;
    }
    await hmsActions.switchCamera();
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
    <PressableIcon
      testID={
        isLocalVideoMuted
          ? TestIds.switch_camera_disabled
          : TestIds.switch_camera
      }
      onPress={handleVideoMuteTogglePress}
      disabled={isLocalVideoMuted}
      style={style}
    >
      <RotateCameraIcon style={cameraIconStyles} />
    </PressableIcon>
  );
};
