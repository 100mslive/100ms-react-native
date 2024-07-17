import type { HMSPermissions } from './HMSPermissions';
import type { HMSPublishSettings } from './HMSPublishSettings';
import type { HMSSubscribeSettings } from './HMSSubscribeSettings';

/**
 * Represents a role within the HMS ecosystem.
 *
 * A role defines the capabilities and permissions a user has in a session, such as publishing or subscribing to streams,
 * and the priority of the user in the session. This class encapsulates the properties of a role, including its name,
 * publishing settings, subscribing settings, permissions, and priority.
 *
 * @class HMSRole
 * @property {string} [name] - The name of the role.
 * @property {HMSPublishSettings} [publishSettings] - Settings related to publishing streams for this role.
 * @property {HMSSubscribeSettings} [subscribeSettings] - Settings related to subscribing to streams for this role.
 * @property {HMSPermissions} [permissions] - Permissions granted to this role.
 * @property {number} [priority] - The priority of the role, determining its precedence in the session.
 *
 * @see https://www.100ms.live/docs/get-started/v2/get-started/concepts/templates-and-roles
 *
 */
export class HMSRole {
  name?: string;
  publishSettings?: HMSPublishSettings;
  subscribeSettings?: HMSSubscribeSettings;
  permissions?: HMSPermissions;
  priority?: number;

  constructor(params?: {
    name?: string;
    priority?: number;
    permissions?: HMSPermissions;
    publishSettings?: HMSPublishSettings;
    subscribeSettings?: HMSSubscribeSettings;
  }) {
    if (params) {
      this.name = params.name;
      this.priority = params.priority;
      this.permissions = params.permissions;
      this.publishSettings = params.publishSettings;
      this.subscribeSettings = params.subscribeSettings;
    }
  }
}
