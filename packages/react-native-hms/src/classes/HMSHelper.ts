import type { HMSRole } from './HMSRole';

export class HMSHelper {
  static getRoleNames(roles: HMSRole[]) {
    let names: string[] = [];

    roles?.map((item: HMSRole) => {
      if (item?.name) {
        names.push(item?.name);
      }
    });

    return names;
  }
}
