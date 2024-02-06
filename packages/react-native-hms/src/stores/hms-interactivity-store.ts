import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createHMSPollsSlice } from './hms-polls-slice';
import type { HMSInteractivityStore } from './types';

export const useHMSInteractivityStore = create<HMSInteractivityStore>()(
  // [['zustand/subscribeWithSelector', never], ['zustand/immer', never]]
  subscribeWithSelector(
    immer((...a) => ({
      ...createHMSPollsSlice(...a),
    }))
  )
);
