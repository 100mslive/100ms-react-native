import type HMSPermissions from './HMSPermissions';

export default class HMSRole {
  name?: string;
  priority?: number;
  permissions: HMSPermissions;

  constructor(params: {
    name?: string;
    priority?: number;
    permissions: HMSPermissions;
  }) {
    this.name = params.name;
    this.priority = params.priority;
    this.permissions = params.permissions;
  }
}
