export class HMSRTCStats {
  bitrateReceived?: number;
  bitrateSent?: number;
  bytesReceived?: number;
  bytesSent?: number;
  packetsLost?: number;
  packetsReceived?: number;
  roundTripTime?: number;

  constructor(params: {
    bitrateReceived?: number;
    bitrateSent?: number;
    bytesReceived?: number;
    bytesSent?: number;
    packetsLost?: number;
    packetsReceived?: number;
    roundTripTime?: number;
  }) {
    this.bitrateReceived = params.bitrateReceived;
    this.bitrateSent = params.bitrateSent;
    this.bytesReceived = params.bytesReceived;
    this.bytesSent = params.bytesSent;
    this.packetsLost = params.packetsLost;
    this.packetsReceived = params.packetsReceived;
    this.roundTripTime = params.roundTripTime;
  }
}
