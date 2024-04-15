import * as React from 'react';
import { View } from 'react-native';

import {
  useHMSConferencingScreenConfig,
  useHMSLayoutConfig,
} from '../hooks-util';
import { HMSManageRaiseHand } from './HMSManageRaiseHand';
import {
  useCanPublishAudio,
  useCanPublishScreen,
  useCanPublishVideo,
} from '../hooks-sdk';

export const HLSHandRaiseButton = () => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();
  const canPublishScreen = useCanPublishScreen();

  const canRaiseHand = useHMSConferencingScreenConfig(
    (confScreenConfig) => !!confScreenConfig?.elements?.hand_raise
  );
  const isOnStage = useHMSLayoutConfig((layoutConfig) => {
    return !!layoutConfig?.screens?.conferencing?.default?.elements
      ?.on_stage_exp;
  });

  const isViewer = !(canPublishAudio || canPublishVideo || canPublishScreen);

  const canShowHandRaiseInFooter = canRaiseHand && !isOnStage && isViewer;

  if (!canShowHandRaiseInFooter) {
    return null;
  }

  return (
    <View style={{ marginLeft: 12 }}>
      <HMSManageRaiseHand />
    </View>
  );
};
