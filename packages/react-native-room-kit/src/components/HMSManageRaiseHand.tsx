import * as React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import type { RootState } from '../redux';
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
      active={localPeerMetadata.isHandRaised}
    >
      <HandIcon />
    </PressableIcon>
  );
};
