import * as React from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useHMSActions } from '../hooks-sdk';
import { PressableIcon } from './PressableIcon';
import { HandIcon } from '../Icons';
import { parseMetadata } from '../utils/functions';
import { TestIds } from '../utils/constants';

export const HMSManageRaiseHand = () => {
  const hmsActions = useHMSActions();
  const localPeerMetadata = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.metadata
  );
  const parsedLocalPeerMetadata = parseMetadata(localPeerMetadata);
  const isBRBOn = !!parsedLocalPeerMetadata.isBRBOn;
  const isHandRaised = useSelector(
    (state: RootState) => !!state.hmsStates.localPeer?.isHandRaised
  );

  const toggleRaiseHand = async () => {
    if (isBRBOn) {
      const newMetadata = {
        ...parsedLocalPeerMetadata,
        isBRBOn: false,
      };
      await hmsActions.changeMetadata(newMetadata);
    }
    if (isHandRaised) {
      await hmsActions.lowerLocalPeerHand();
    } else {
      await hmsActions.raiseLocalPeerHand();
    }
  };

  return (
    <PressableIcon testID={isHandRaised ? TestIds.hand_raised_btn : TestIds.hand_raise_btn} onPress={toggleRaiseHand} active={isHandRaised}>
      <HandIcon />
    </PressableIcon>
  );
};
