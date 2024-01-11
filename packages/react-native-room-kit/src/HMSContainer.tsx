import * as React from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

import type { RootState } from './redux';
import { HMSInstanceSetup } from './HMSInstanceSetup';
import { HMSRoomSetup } from './HMSRoomSetup';
import { MeetingState } from './types';
import { clearStore } from './redux/actions';

export const HMSContainer = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch();
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  React.useEffect(() => {
    if (hmsInstance) {
      const cleanup = async () => {
        const userExited =
          store.getState().app.meetingState === MeetingState.EXITED;
        if (!userExited) {
          await hmsInstance.leave();
          await hmsInstance.destroy();
        }
        dispatch(clearStore());
      };
      return () => {
        cleanup();
      };
    }
  }, [hmsInstance, store]);

  const isHMSInstanceAvailable = !!hmsInstance;

  if (isHMSInstanceAvailable) {
    return <HMSRoomSetup />;
  }

  return <HMSInstanceSetup />;
};
