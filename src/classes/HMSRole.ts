import type { HMSPermissions } from './HMSPermissions';
import type { HMSPublishSettings } from './HMSPublishSettings';
import type { HMSSubscribeSettings } from './HMSSubscribeSettings';

export class HMSRole {
  name?: string;
  publishSettings?: HMSPublishSettings;
  subscribeSettings?: HMSSubscribeSettings;
  permissions?: HMSPermissions;
  priority?: number;
  generalPermissions?: any;
  internalPlugins?: any;
  externalPlugins?: any;

  constructor(params?: {
    name?: string;
    priority?: number;
    permissions?: HMSPermissions;
    publishSettings?: HMSPublishSettings;
    subscribeSettings?: HMSSubscribeSettings;
    generalPermissions?: any;
    internalPlugins?: any;
    externalPlugins?: any;
  }) {
    if (params) {
      this.name = params.name;
      this.priority = params.priority;
      this.permissions = params.permissions;
      this.publishSettings = params.publishSettings;
      this.subscribeSettings = params.subscribeSettings;
      this.generalPermissions = params.generalPermissions;
      this.internalPlugins = params.internalPlugins;
      this.externalPlugins = params.externalPlugins;
    }
  }
}
