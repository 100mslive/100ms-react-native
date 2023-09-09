import * as React from 'react';

import { HMSNotifications } from './HMSNotifications';
import { OverlayContainer } from './OverlayContainer';
import { HLSChatView } from './HMSOverlayChatView';
import { useShowChat } from '../hooks-util';

export type OverlayedViewsProps = {};

const _OverlayedViews: React.FC<OverlayedViewsProps> = () => {
  const [showChatType] = useShowChat();

  return (
    <OverlayContainer.Overlay>
      {showChatType === 'inset' ? <HLSChatView /> : null}

      <HMSNotifications />
    </OverlayContainer.Overlay>
  );
};

export const OverlayedViews = React.memo(_OverlayedViews);
