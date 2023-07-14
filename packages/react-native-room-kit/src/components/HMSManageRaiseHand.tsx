import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';

import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { HandIcon } from '../Icons';
import { parseMetadata } from '../utils/functions';

export const HMSManageRaiseHand = () => {
  const hmsActions = useHMSActions();
  const localPeerMetadata = useSelector(
    (state: RootState) => parseMetadata(state.hmsStates.localPeer?.metadata),
    shallowEqual
  );

  const toggleRaiseHand = async () => {
    const newMetadata = {
      ...localPeerMetadata,
      isHandRaised: !localPeerMetadata.isHandRaised,
      isBRBOn: false,
    };
    await hmsActions.changeMetadata(newMetadata);
  };

  return (
    <PressableIcon
      onPress={toggleRaiseHand}
      style={localPeerMetadata.isHandRaised ? styles.activeButton : undefined}
    >
      <HandIcon
        style={localPeerMetadata.isHandRaised ? styles.handRaised : undefined}
      />
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  activeButton: {
    backgroundColor: COLORS.SECONDARY.DIM,
    borderColor: COLORS.SECONDARY.DIM,
  },
  handRaised: {
    tintColor: COLORS.TWIN.YELLOW,
  },
});
