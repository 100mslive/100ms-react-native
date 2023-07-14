import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { MicIcon } from '../Icons';
import { useCanPublishAudio, useHMSActions } from '../hooks-sdk';
import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { PressableIcon } from './PressableIcon';

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

  return (
    <PressableIcon
      onPress={handleAudioMuteTogglePress}
      style={isLocalAudioMuted ? styles.mutedButton : undefined}
    >
      <MicIcon muted={!!isLocalAudioMuted} />
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  mutedButton: {
    backgroundColor: COLORS.SECONDARY.DIM,
    borderColor: COLORS.SECONDARY.DIM,
  },
});
