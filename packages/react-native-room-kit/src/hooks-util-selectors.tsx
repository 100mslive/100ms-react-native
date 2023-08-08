import type { HMSPeer } from '@100mslive/react-native-hms';
import { JoinForm_JoinBtnType } from '@100mslive/types-prebuilt/elements/join_form';

import type { RootState } from './redux';

export const selectIsHLSViewer = (peer: HMSPeer | null | undefined) =>
  peer?.role?.name?.includes('hls') ?? false;

export const selectShouldGoLive = (state: RootState) => {
  const layoutConfig = state.hmsStates.layoutConfig;
  const isHLSStreaming = state.hmsStates.room?.hlsStreamingState.running;

  const joinButtonType =
    layoutConfig?.screens?.preview?.default?.elements?.join_form?.join_btn_type;

  const canStartHLSStreaming =
    joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_AND_GO_LIVE ||
    joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_ONLY
      ? // can start if `joinButtonType` is `JOIN_BTN_TYPE_JOIN_AND_GO_LIVE`
        joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_AND_GO_LIVE
      : // Check if the Role has permission to start HLS Stream
        state.hmsStates.localPeer?.role?.permissions?.hlsStreaming;

  return canStartHLSStreaming && !isHLSStreaming;
};
