import * as React from 'react';
import { useSelector } from 'react-redux';
import type { StyleProp, ViewStyle } from 'react-native';

import type { RootState } from '../redux';
import { useCanPublishVideo, useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { CameraIcon } from '../Icons';
import { TestIds } from '../utils/constants';

interface HMSManageLocalVideoProps extends ToggleVideoMuteButtonProps {}

export const HMSManageLocalVideo: React.FC<HMSManageLocalVideoProps> = ({
  style,
}) => {
  const canPublishVideo = useCanPublishVideo();

  if (!canPublishVideo) {
    return null;
  }

  return <ToggleVideoMuteButton style={style} />;
};

interface ToggleVideoMuteButtonProps {
  style?: StyleProp<ViewStyle>;
}

const ToggleVideoMuteButton: React.FC<ToggleVideoMuteButtonProps> = ({
  style,
}) => {
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
      testID={
        !!isLocalVideoMuted
          ? TestIds.camera_muted_btn
          : TestIds.camera_unmuted_btn
      }
      onPress={handleVideoMuteTogglePress}
      active={isLocalVideoMuted}
      style={style}
    >
      <CameraIcon muted={!!isLocalVideoMuted} />
    </PressableIcon>
  );
};
