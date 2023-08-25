import * as React from 'react';

import { HMSNotification } from './HMSNotification';
import { PersonIcon } from '../Icons';

export interface HMSRoleChangeDeclinedNotificationProps {
  peerName: string;
  id: string;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const HMSRoleChangeDeclinedNotification: React.FC<
  HMSRoleChangeDeclinedNotificationProps
> = ({ peerName, id, autoDismiss, dismissDelay }) => {
  return (
    <HMSNotification
      id={id}
      text={`${peerName} declined the request to join the stage`}
      icon={<PersonIcon type="off" />}
      autoDismiss={autoDismiss}
      dismissDelay={dismissDelay}
    />
  );
};
