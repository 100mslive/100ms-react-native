import React from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from './redux';
import { HMSInstanceSetup } from './HMSInstanceSetup';
import { HMSRoomSetup } from './HMSRoomSetup';

export const HMSContainer = () => {
  const isHMSInstanceAvailable = useSelector(
    (state: RootState) => !!state.user.hmsInstance
  );

  if (isHMSInstanceAvailable) {
    return <HMSRoomSetup />;
  }

  return <HMSInstanceSetup />;
};
