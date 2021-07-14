export default class HMSVideoSettings {
  bitrate?: number;
  frameRate: number;
  width: number;
  height: number;

  constructor(params: {
    bitrate?: number;
    frameRate: number;
    width: number;
    height: number;
  }) {
    this.bitrate = params.bitrate;
    this.frameRate = params.frameRate;
    this.width = params.width;
    this.height = params.height;
  }
}
