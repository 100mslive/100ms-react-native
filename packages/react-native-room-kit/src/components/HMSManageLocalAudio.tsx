import * as React from 'react';
import { useSelector } from 'react-redux';

import { MicIcon } from '../Icons';
import { useCanPublishAudio, useHMSActions } from '../hooks-sdk';
import type { RootState } from '../redux';
import { PressableIcon } from './PressableIcon';
import { useHMSRoomStyle } from '../hooks-util';

export const HMSManageLocalAudio = () => {
  const canPublishAudio = useCanPublishAudio();

  if (!canPublishAudio) {
    return null;
  }

  return <ToggleAudioMuteButton />;
};

const ToggleAudioMuteButton = () => {
  const hmsActions = useHMSActions();
  // TODO: set initial `isLocalAudioMuted` state value as per initial track setting
  const isLocalAudioMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalAudioMuted
  );

  const handleAudioMuteTogglePress = async () => {
    // TODO: add getter API for state
    // const enabled = hmsStore.getState(selectIsLocalAudioEnabled);
    await hmsActions.setLocalAudioEnabled(!isLocalAudioMuted);
  };

  const mutedButtonStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.secondary_dim,
    borderColor: theme.palette.secondary_dim,
  }));

  return (
    <PressableIcon
      onPress={handleAudioMuteTogglePress}
      style={isLocalAudioMuted ? mutedButtonStyles : undefined}
    >
      <MicIcon muted={!!isLocalAudioMuted} />
    </PressableIcon>
  );
};
