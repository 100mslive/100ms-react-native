export class HMSPermissions {
  endRoom?: boolean;
  removeOthers?: boolean;
  stopPresentation?: boolean;
  mute?: boolean;
  askToUnmute?: boolean;
  muteSelective?: boolean;
  changeRole?: boolean;

  constructor(params?: {
    endRoom?: boolean;
    removeOthers?: boolean;
    stopPresentation?: boolean;
    mute?: boolean;
    askToUnmute?: boolean;
    muteSelective?: boolean;
    changeRole?: boolean;
  }) {
    if (params) {
      this.endRoom = params.endRoom;
      this.removeOthers = params.removeOthers;
      this.stopPresentation = params.stopPresentation;
      this.mute = params.mute;
      this.askToUnmute = params.askToUnmute;
      this.muteSelective = params.muteSelective;
      this.changeRole = params.changeRole;
    }
  }
}
