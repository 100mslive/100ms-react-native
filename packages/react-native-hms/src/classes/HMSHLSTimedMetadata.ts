export class HMSHLSTimedMetadata {
  payload: string;
  duration?: number;

  constructor(params: { payload: string; duration?: number }) {
    this.payload = params.payload;
    this.duration = params.duration;
  }
}
