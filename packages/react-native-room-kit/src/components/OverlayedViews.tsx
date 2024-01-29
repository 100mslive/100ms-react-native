import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';

import { HMSNotifications } from './HMSNotifications';
import { OverlayContainer } from './OverlayContainer';
import type { OverlayProps } from './OverlayContainer';
import { HLSChatView } from './HMSOverlayChatView';
import { useShowChatAndParticipants } from '../hooks-util';

export type OverlayedViewsProps = {
  offset: SharedValue<number>;
} & OverlayProps;

const _OverlayedViews: React.FC<OverlayedViewsProps> = ({
  offset,
  animatedStyle,
}) => {
  const { overlayChatVisible } = useShowChatAndParticipants();

  return (
    <OverlayContainer.Overlay animatedStyle={animatedStyle}>
      {overlayChatVisible ? <HLSChatView offset={offset} /> : null}

      <HMSNotifications />
    </OverlayContainer.Overlay>
  );
};

export const OverlayedViews = React.memo(_OverlayedViews);
