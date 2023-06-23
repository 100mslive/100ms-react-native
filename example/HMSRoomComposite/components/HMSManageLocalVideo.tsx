import * as React from 'react';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';

import {RootState} from '../redux';
import {CustomButton} from './CustomButton';
import {COLORS} from '../utils/theme';
import {useCanPublishVideo, useHMSActions} from '../hooks-sdk';

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
    (state: RootState) => state.hmsStates.isLocalVideoMuted,
  );

  const handleVideoMuteTogglePress = async () => {
    // TODO: add getter API for state
    // const enabled = hmsStore.getState(selectIsLocalVideoEnabled);
    await hmsActions.setLocalVideoEnabled(!isLocalVideoMuted);
  };

  return (
    <CustomButton
      onPress={handleVideoMuteTogglePress}
      viewStyle={[styles.singleIconContainer, isLocalVideoMuted && styles.mute]}
      LeftIcon={
        <Feather
          name={isLocalVideoMuted ? 'video-off' : 'video'}
          style={[styles.videoIcon, isLocalVideoMuted && styles.muteVideoIcon]}
          size={32}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  singleIconContainer: {
    padding: 8,
    backgroundColor: COLORS.BORDER.LIGHT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: 'auto',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  mute: {
    backgroundColor: COLORS.TEXT.HIGH_EMPHASIS,
    borderColor: COLORS.TEXT.HIGH_EMPHASIS,
  },
  videoIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    height: 32,
  },
  muteVideoIcon: {
    color: COLORS.BORDER.LIGHT,
  },
});
