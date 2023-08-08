import * as React from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useCanPublishVideo, useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { CameraIcon } from '../Icons';
import { useHMSRoomStyle } from '../hooks-util';

export const HMSManageLocalVideo = () => {
  const canPublishVideo = useCanPublishVideo();

  if (!canPublishVideo) {
    return null;
  }

  return <ToggleVideoMuteButton />;
};

const ToggleVideoMuteButton = () => {
  const hmsActions = useHMSActions();
  // TODO: set initial `isLocalVideoMuted` state value as per initial track setting
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  const handleVideoMuteTogglePress = async () => {
    // TODO: add getter API for state
    // const enabled = hmsStore.getState(selectIsLocalVideoEnabled);
    await hmsActions.setLocalVideoEnabled(!isLocalVideoMuted);
  };

  const mutedButtonStyles = useHMSRoomStyle(theme => ({
    backgroundColor: theme.palette.secondary_dim,
    borderColor: theme.palette.secondary_dim,
  }));

  return (
    <PressableIcon
      onPress={handleVideoMuteTogglePress}
      style={isLocalVideoMuted ? mutedButtonStyles : undefined}
    >
      <CameraIcon muted={!!isLocalVideoMuted} />
    </PressableIcon>
  );
};
