export class HMSPermissions {
  endRoom?: boolean;
  removeOthers?: boolean;
  unmute?: boolean;
  mute?: boolean;
  changeRole?: boolean;
  recording?: boolean;
  streaming?: boolean;

  constructor(params?: {
    endRoom?: boolean;
    removeOthers?: boolean;
    unmute?: boolean;
    mute?: boolean;
    changeRole?: boolean;
    recording?: boolean;
    streaming?: boolean;
  }) {
    if (params) {
      this.endRoom = params.endRoom;
      this.removeOthers = params.removeOthers;
      this.unmute = params.unmute;
      this.mute = params.mute;
      this.changeRole = params.changeRole;
      this.recording = params.recording;
      this.streaming = params.streaming;
    }
  }
}
