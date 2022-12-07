import type { HMSLayer } from "./HMSLayer";
import type { HMSVideoResolution } from "./HMSVideoResolution";

export class HMSSimulcastLayerDefinition {
    layer: HMSLayer;
    resolution: HMSVideoResolution;

    constructor(params: {layer: HMSLayer, resolution: HMSVideoResolution}) {
        this.layer = params.layer;
        this.resolution = params.resolution;
    }
}