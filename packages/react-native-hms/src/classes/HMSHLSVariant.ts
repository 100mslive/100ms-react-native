import type { HMSHLSPlaylistType } from './HMSHLSPlaylistType';

export class HMSHLSVariant {
  hlsStreamUrl?: string;
  meetingUrl?: string;
  metadata?: string;
  startedAt?: Date;
  playlistType?: HMSHLSPlaylistType;

  constructor(params: {
    hlsStreamUrl?: string;
    meetingUrl?: string;
    metadata?: string;
    startedAt?: Date;
    playlistType?: HMSHLSPlaylistType;
  }) {
    this.hlsStreamUrl = params.hlsStreamUrl;
    this.meetingUrl = params.meetingUrl;
    this.metadata = params.metadata;
    this.startedAt = params.startedAt;
    this.playlistType = params.playlistType;
  }
}
