import * as React from 'react';
import {useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import {RootState} from '../redux';
import {CustomButton} from './CustomButton';
import {COLORS} from '../utils/theme';
import {useCanPublishAudio, useHMSActions} from '../hooks-sdk';

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
    (state: RootState) => state.hmsStates.isLocalAudioMuted,
  );

  const handleAudioMuteTogglePress = async () => {
    // TODO: add getter API for state
    // const enabled = hmsStore.getState(selectIsLocalAudioEnabled);
    await hmsActions.setLocalAudioEnabled(!isLocalAudioMuted);
  };

  return (
    <CustomButton
      onPress={handleAudioMuteTogglePress}
      viewStyle={[styles.singleIconContainer, isLocalAudioMuted && styles.mute]}
      LeftIcon={
        <Feather
          name={isLocalAudioMuted ? 'mic-off' : 'mic'}
          style={[styles.videoIcon, isLocalAudioMuted && styles.muteVideoIcon]}
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
