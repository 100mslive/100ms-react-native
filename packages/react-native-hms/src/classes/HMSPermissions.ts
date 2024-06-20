import type { TranscriptionsMode } from './transcriptions';

export interface HMSWhiteboardPermission {
  admin?: boolean;
  write?: boolean;
  read?: boolean;
}

export interface HMSTranscriptionPermissions {
  admin: boolean;
  read: boolean;
  mode?: TranscriptionsMode;
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
  transcriptions?: Array<HMSTranscriptionPermissions>;

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
    transcriptions?: Array<HMSTranscriptionPermissions>;
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
      this.transcriptions = params.transcriptions;
    }
  }
}
