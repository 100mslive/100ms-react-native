import * as React from 'react';

import { HMSNotifications } from './HMSNotifications';
import { OverlayContainer } from './OverlayContainer';
import { HLSChatView } from './HMSOverlayChatView';
import { useShowChatAndParticipants } from '../hooks-util';

export type OverlayedViewsProps = {};

const _OverlayedViews: React.FC<OverlayedViewsProps> = () => {
  const {overlayChatVisible} = useShowChatAndParticipants();

  return (
    <OverlayContainer.Overlay>
      {overlayChatVisible ? <HLSChatView /> : null}

      <HMSNotifications />
    </OverlayContainer.Overlay>
  );
};

export const OverlayedViews = React.memo(_OverlayedViews);
