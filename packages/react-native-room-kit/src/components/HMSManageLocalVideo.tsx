import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { useCanPublishVideo, useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { CameraIcon } from '../Icons';

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

  return (
    <PressableIcon
      onPress={handleVideoMuteTogglePress}
      style={isLocalVideoMuted ? styles.mutedButton : undefined}
    >
      <CameraIcon muted={!!isLocalVideoMuted} />
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  mutedButton: {
    backgroundColor: COLORS.SECONDARY.DIM,
    borderColor: COLORS.SECONDARY.DIM,
  },
});
