export class HMSPermissions {
  endRoom?: boolean;
  removeOthers?: boolean;
  unmute?: boolean;
  mute?: boolean;
  changeRole?: boolean;
  browserRecording?: boolean;
  hlsStreaming?: boolean;
  rtmpStreaming?: boolean;

  constructor(params?: {
    endRoom?: boolean;
    removeOthers?: boolean;
    unmute?: boolean;
    mute?: boolean;
    changeRole?: boolean;
    browserRecording?: boolean;
    hlsStreaming?: boolean;
    rtmpStreaming?: boolean;
  }) {
    if (params) {
      this.endRoom = params.endRoom;
      this.removeOthers = params.removeOthers;
      this.unmute = params.unmute;
      this.mute = params.mute;
      this.changeRole = params.changeRole;
      this.browserRecording = params.browserRecording;
      this.hlsStreaming = params.hlsStreaming;
      this.rtmpStreaming = params.rtmpStreaming;
    }
  }
}
