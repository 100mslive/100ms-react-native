import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from './redux';
import { HMSInstanceSetup } from './HMSInstanceSetup';
import { HMSRoomSetup } from './HMSRoomSetup';
import { MeetingState } from './types';
import { clearStore } from './redux/actions';

export const HMSContainer = () => {
  const dispatch = useDispatch();
  const isHMSInstanceAvailable = useSelector(
    (state: RootState) => !!state.user.hmsInstance
  );
  const outOfMeeting = useSelector(
    (state: RootState) =>
      state.app.meetingState === MeetingState.OUT_FROM_MEETING
  );
  const canCleanupAfter = isHMSInstanceAvailable && outOfMeeting;

  React.useEffect(() => {
    if (canCleanupAfter) {
      return () => {
        dispatch(clearStore());
      };
    }
  }, [canCleanupAfter]);

  if (isHMSInstanceAvailable) {
    return <HMSRoomSetup />;
  }

  return <HMSInstanceSetup />;
};
