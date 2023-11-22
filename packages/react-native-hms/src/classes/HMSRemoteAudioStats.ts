export class HMSRemoteAudioStats {
  bitrate?: number;
  packetsReceived?: number;
  packetsLost?: number;
  bytesReceived?: number;
  jitter?: number;

  constructor(params: {
    bitrate?: number;
    packetsReceived?: number;
    packetsLost?: number;
    bytesReceived?: number;
    jitter?: number;
  }) {
    this.bitrate = params.bitrate;
    this.packetsReceived = params.packetsReceived;
    this.jitter = params.jitter;
    this.packetsLost = params.packetsLost;
    this.bytesReceived = params.bytesReceived;
  }
}
