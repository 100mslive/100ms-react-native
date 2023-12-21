import type {
  DefaultConferencingScreen,
  HLSLiveStreamingScreen,
  Layout,
} from '@100mslive/types-prebuilt';
import type { HMSRole } from '@100mslive/react-native-hms';
import { JoinForm_JoinBtnType } from '@100mslive/types-prebuilt/elements/join_form';

import type { RootState } from './redux';
import { selectIsHLSStreamingOn } from './hooks-sdk-selectors';

export const selectIsHLSViewer = (
  role: HMSRole | null | undefined,
  layoutConfig: Layout | null | undefined
) => {
  if (layoutConfig) {
    return !!layoutConfig.screens?.conferencing?.hls_live_streaming;
  }
  return role?.name?.includes('hls-') ?? false;
};

export const selectLayoutConfigForRole = (
  layoutConfig: Layout[] | null,
  role: HMSRole | null
): Layout | null => {
  if (layoutConfig === null || layoutConfig.length <= 0) {
    return null;
  }

  if (role === null) {
    return layoutConfig[0] || null;
  }

  const selectedLayout = layoutConfig.find(
    (layout) => layout.role === role.name
  );

  return selectedLayout || layoutConfig[0] || null;
};

export const selectShouldGoLive = (state: RootState) => {
  const currentRole = state.hmsStates.localPeer?.role || null;

  const layoutConfig = selectLayoutConfigForRole(
    state.hmsStates.layoutConfig,
    currentRole
  );

  const isHLSStreaming = selectIsHLSStreamingOn(state);

  const joinButtonType =
    layoutConfig?.screens?.preview?.default?.elements?.join_form
      ?.join_btn_type ?? JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_ONLY;

  const canStartHLSStreaming =
    joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_AND_GO_LIVE ||
    joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_ONLY
      ? // can start if `joinButtonType` is `JOIN_BTN_TYPE_JOIN_AND_GO_LIVE`
        joinButtonType === JoinForm_JoinBtnType.JOIN_BTN_TYPE_JOIN_AND_GO_LIVE
      : // Check if the Role has permission to start HLS Stream
        state.hmsStates.localPeer?.role?.permissions?.hlsStreaming;

  return canStartHLSStreaming && !isHLSStreaming;
};

export const selectChatLayoutConfig = (layoutConfig: Layout | null) => {
  const conferencingConfig = layoutConfig?.screens?.conferencing;
  const screenOptions = conferencingConfig
    ? conferencingConfig.default || conferencingConfig.hls_live_streaming
    : null;

  return screenOptions?.elements?.chat ?? null;
};

export const selectVideoTileLayoutConfig = (layoutConfig: Layout | null) => {
  return layoutConfig?.screens?.conferencing?.default?.elements
    ?.video_tile_layout;
};

export const selectConferencingScreenConfig = (
  layoutConfig: Layout | null
): DefaultConferencingScreen | HLSLiveStreamingScreen | null => {
  const conferencingConfig = layoutConfig?.screens?.conferencing;
  return (
    (conferencingConfig?.default || conferencingConfig?.hls_live_streaming) ??
    null
  );
};
