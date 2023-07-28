import type { HMSPeer } from '@100mslive/react-native-hms';

import type { RootState } from './redux';

export const selectIsHLSViewer = (peer: HMSPeer | null | undefined) =>
  peer?.role?.name?.includes('hls') ?? false;

export const selectShouldGoLive = (state: RootState) => {
  const isHLSStreaming = state.hmsStates.room?.hlsStreamingState.running;
  const canStartHLSStreaming =
    state.hmsStates.localPeer?.role?.permissions?.hlsStreaming;

  return canStartHLSStreaming && !isHLSStreaming;
};
