export default class HMSPermissions {
  endRoom?: boolean;
  removeOthers?: boolean;
  stopPresentation?: boolean;
  muteAll?: boolean;
  askToUnmute?: boolean;
  muteSelective?: boolean;
  changeRole?: Boolean;

  constructor(params?: {
    endRoom?: boolean;
    removeOthers?: boolean;
    stopPresentation?: boolean;
    muteAll?: boolean;
    askToUnmute?: boolean;
    muteSelective?: boolean;
    changeRole?: boolean;
  }) {
    if (params) {
      this.endRoom = params.endRoom;
      this.removeOthers = params.removeOthers;
      this.stopPresentation = params.stopPresentation;
      this.muteAll = params.muteAll;
      this.askToUnmute = params.askToUnmute;
      this.muteSelective = params.muteSelective;
      this.changeRole = params.changeRole;
    }
  }
}
