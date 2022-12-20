export class HMSSimulcastLayerSettingsPolicy {
    rid: String;
    scaleResolutionDownBy?: number;
    maxBitrate?: number;
    maxFramerate?: number;
    constructor(params: {
        rid: String;
        scaleResolutionDownBy?: number
        maxBitrate?: number
        maxFramerate?: number;
    }) {
        this.rid = params.rid;
        this.scaleResolutionDownBy = params.scaleResolutionDownBy;
        this.maxBitrate = params.maxBitrate;
        this.maxFramerate = params.maxFramerate;
    }
}