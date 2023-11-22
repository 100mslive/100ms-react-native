import type { HMSRole } from './HMSRole';
import type { HMSPeer } from './HMSPeer';

export class HMSRoleChangeRequest {
  requestedBy?: HMSPeer;
  suggestedRole: HMSRole;

  constructor(params: { requestedBy?: HMSPeer; suggestedRole: HMSRole }) {
    if (params.requestedBy) {
      this.requestedBy = params.requestedBy;
    }
    this.suggestedRole = params.suggestedRole;
  }
}
