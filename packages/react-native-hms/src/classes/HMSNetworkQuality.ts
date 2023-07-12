export class HMSNetworkQuality {
  downlinkQuality: number;

  constructor(params: { downlinkQuality: number }) {
    this.downlinkQuality = params.downlinkQuality;
  }
}
