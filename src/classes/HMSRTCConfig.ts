export class HMSRTCConfig {
  rtcStatsAllowed: boolean = false;
  localAudioStatsAllowed: boolean = false;
  localVideoStatsAllowed: boolean = false;
  remoteAudioStatsAllowed: boolean = false;
  remoteVideoStatsAllowed: boolean = false;

  constructor(params?: {
    rtcStatsAllowed: boolean;
    localAudioStatsAllowed: boolean;
    localVideoStatsAllowed: boolean;
    remoteAudioStatsAllowed: boolean;
    remoteVideoStatsAllowed: boolean;
  }) {
    if (params) {
      this.rtcStatsAllowed = params.rtcStatsAllowed;
      this.localAudioStatsAllowed = params.localAudioStatsAllowed;
      this.localVideoStatsAllowed = params.localVideoStatsAllowed;
      this.remoteAudioStatsAllowed = params.remoteAudioStatsAllowed;
      this.remoteVideoStatsAllowed = params.remoteVideoStatsAllowed;
    }
  }
}
