import type { HMSPermissions } from './HMSPermissions';
import type { HMSPublishSettings } from './HMSPublishSettings';
import type { HMSSubscribeSettings } from './HMSSubscribeSettings';

export class HMSRole {
  name: string;
  priority: number;
  permissions: HMSPermissions;
  publishSettings?: HMSPublishSettings;
  subscribeSettings?: HMSSubscribeSettings;
  constructor(params: {
    name: string;
    priority: number;
    permissions: HMSPermissions;
    publishSettings?: HMSPublishSettings;
    subscribeSettings?: HMSSubscribeSettings;
  }) {
    this.name = params.name;
    this.priority = params.priority;
    this.permissions = params.permissions;
    this.publishSettings = params.publishSettings;
    this.subscribeSettings = params.subscribeSettings;
  }
}
