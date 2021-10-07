import type { HMSRole } from './HMSRole';

export class HMSHelper {
  static getRoleNames(roles: HMSRole[]) {
    let names: String[] = [];

    roles?.map((item: HMSRole) => {
      if (item.name) {
        names.push(item.name);
      }
    });

    return names;
  }
}
