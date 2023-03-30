export class HMSLocalAudioStats {
  bitrate?: number;
  bytesSent?: number;
  roundTripTime?: number;

  constructor(params: {
    bitrate?: number;
    bytesSent?: number;
    roundTripTime?: number;
  }) {
    this.bitrate = params.bitrate;
    this.bytesSent = params.bytesSent;
    this.roundTripTime = params.roundTripTime;
  }
}
