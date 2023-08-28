import * as React from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { HMSVideoView } from './HMSVideoView';

export const HMSLocalVideoView = () => {
  const localVideoTrackId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.videoTrack?.trackId
  );

  return localVideoTrackId ? (
    <HMSVideoView trackId={localVideoTrackId} />
  ) : null;
};
