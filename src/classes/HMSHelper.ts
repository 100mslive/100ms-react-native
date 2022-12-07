import { HMSEncoder } from './HMSEncoder';
import type { HMSLayer } from './HMSLayer';
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

  static getSimulcastLayersWithCurrentActive(data: any) {
    return {
      activeLayer: data.activeLayer as HMSLayer,
      layerDefinition: HMSEncoder.encodeHMSSimulcastLayerDefinition(data.layerDefinition)
    };
  }
}
