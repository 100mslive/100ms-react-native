import type HMSAudioTrack from './HMSAudioTrack';
import HMSPeer from './HMSPeer';
import HMSRemoteAudioTrack from './HMSRemoteAudioTrack';
import HMSRemoteVideoTrack from './HMSRemoteVideoTrack';
import type HMSTrack from './HMSTrack';
import type HMSVideoTrack from './HMSVideoTrack';

export default class HMSRemotePeer extends HMSPeer {
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
    name: string;
    isLocal?: boolean;
    customerUserID?: string;
    customerDescription?: string;
    audioTrack?: HMSAudioTrack;
    videoTrack?: HMSVideoTrack;
    auxiliaryTracks?: HMSTrack[];
    remoteAudioTrackData?: {
      trackId: string;
      source?: number;
      trackDescription?: string;
    };
    remoteVideoTrackData?: {
      trackId: string;
      source?: number;
      trackDescription?: string;
      layer?: any;
    };
  }) {
    super(params);
    this.isLocal = false;

    if (params.remoteAudioTrackData) {
      this.remoteAudio = new HMSRemoteAudioTrack(params.remoteAudioTrackData);
    }

    if (params.remoteVideoTrackData) {
      this.remoteVideo = new HMSRemoteVideoTrack(params.remoteVideoTrackData);
    }
  }
}
