export default class HMSAudioSettings {
  bitRate: number;

  constructor(params: { bitRate: number }) {
    this.bitRate = params.bitRate;
  }
}
