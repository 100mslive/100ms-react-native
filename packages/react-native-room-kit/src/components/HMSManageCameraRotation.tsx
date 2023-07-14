import * as React from 'react';
import { useSelector } from 'react-redux';

import { RotateCameraIcon } from '../Icons';
import { useCanPublishVideo, useHMSActions } from '../hooks-sdk';
import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { PressableIcon } from './PressableIcon';

export const HMSManageCameraRotation = () => {
  const canPublishVideo = useCanPublishVideo();

  if (!canPublishVideo) {
    return null;
  }

  return <RotateCameraButton />;
};

const RotateCameraButton = () => {
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

  return (
    <PressableIcon
      onPress={handleVideoMuteTogglePress}
      disabled={isLocalVideoMuted}
    >
      <RotateCameraIcon
        style={{
          tintColor: isLocalVideoMuted
            ? COLORS.SURFACE.ON_SURFACE.LOW
            : COLORS.SURFACE.ON_SURFACE.HIGH,
        }}
      />
    </PressableIcon>
  );
};
