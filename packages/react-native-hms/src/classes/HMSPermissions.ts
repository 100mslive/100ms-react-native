export interface HMSWhiteboardPermission {
  admin?: boolean;
  write?: boolean;
  read?: boolean;
}

export class HMSPermissions {
  endRoom?: boolean;
  removeOthers?: boolean;
  unmute?: boolean;
  mute?: boolean;
  changeRole?: boolean;
  browserRecording?: boolean;
  hlsStreaming?: boolean;
  rtmpStreaming?: boolean;
  pollRead?: boolean;
  pollWrite?: boolean;
  whiteboard?: HMSWhiteboardPermission;

  constructor(params?: {
    endRoom?: boolean;
    removeOthers?: boolean;
    unmute?: boolean;
    mute?: boolean;
    changeRole?: boolean;
    browserRecording?: boolean;
    hlsStreaming?: boolean;
    rtmpStreaming?: boolean;
    pollRead?: boolean;
    pollWrite?: boolean;
    whiteboard?: HMSWhiteboardPermission;
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
      this.pollRead = params.pollRead;
      this.pollWrite = params.pollWrite;
      this.whiteboard = params.whiteboard;
    }
  }
}
