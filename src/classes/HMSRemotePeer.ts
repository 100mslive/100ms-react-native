import { HMSPeer } from './HMSPeer';
import { HMSRemoteAudioTrack } from './HMSRemoteAudioTrack';
import { HMSRemoteVideoTrack } from './HMSRemoteVideoTrack';
import type { HMSTrackSource } from './HMSTrackSource'

export class HMSRemotePeer extends HMSPeer {
  private remoteAudio?: HMSRemoteAudioTrack;
  private remoteVideo?: HMSRemoteVideoTrack;

  remoteAudioTrack = () => {
    return this.remoteAudio;
  };

  remoteVideoTrack = () => {
    return this.remoteVideo;
  };

  constructor(params: {
    peerID: string;
    remoteAudioTrackData?: {
      trackId: string;
      source?: HMSTrackSource;
      isMute?: boolean;
      trackDescription?: string;
      playbackAllowed?: boolean;
      id: string;
    };
    remoteVideoTrackData?: {
      trackId: string;
      source?: HMSTrackSource;
      trackDescription?: string;
      isMute?: boolean;
      playbackAllowed?: boolean;
      id: string;
    };
  }) {
    super(params);
    if (params.remoteAudioTrackData) {
      this.remoteAudio = new HMSRemoteAudioTrack(params.remoteAudioTrackData);
    }

    if (params.remoteVideoTrackData) {
      this.remoteVideo = new HMSRemoteVideoTrack(params.remoteVideoTrackData);
    }
  }
}
