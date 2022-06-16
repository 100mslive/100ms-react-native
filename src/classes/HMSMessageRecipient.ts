import type { HMSMessageRecipientType } from './HMSMessageRecipientType';
import type { HMSPeer } from './HMSPeer';
import type { HMSRole } from './HMSRole';

export class HMSMessageRecipient {
  public recipientType?: HMSMessageRecipientType;
  public recipientPeer?: HMSPeer;
  public recipientRoles?: HMSRole[];

  constructor(params: {
    recipientType: HMSMessageRecipientType;
    recipientPeer?: HMSPeer;
    recipientRoles?: HMSRole[];
  }) {
    this.recipientType = params.recipientType;
    this.recipientPeer = params.recipientPeer;
    this.recipientRoles = params.recipientRoles;
  }
}
