export class HMSRtmpVideoResolution {
  height: number;
  width: number;

  constructor(params: { height: number; width: number }) {
    this.height = params.height;
    this.width = params.width;
  }
}
