import type HMSAudioTrack from './HMSAudioTrack';
import HMSPeer from './HMSPeer';
import type HMSTrack from './HMSTrack';
import type HMSVideoTrack from './HMSVideoTrack';
import type HMSVideoTrackSettings from './HMSVideoTrackSettings';
import type HMSAudioTrackSettings from './HMSAudioTrackSettings';
import HMSLocalAudioTrack from './HMSLocalAudioTrack';
import HMSLocalVideoTrack from './HMSLocalVideoTrack';

export default class HMSLocalPeer extends HMSPeer {
  private localAudio?: HMSLocalAudioTrack;
  private localVideo?: HMSLocalVideoTrack;

  localAudioTrack = () => {
    return this.localAudio;
  };
  localVideoTrack = () => {
    return this.localVideo;
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
    localAudioTrackData?: {
      trackId: string;
      source?: number;
      trackDescription?: string;
      settings?: HMSAudioTrackSettings;
    };
    localVideoTrackData?: {
      trackId: string;
      source?: number;
      trackDescription?: string;
      settings?: HMSVideoTrackSettings;
    };
  }) {
    super(params);
    this.isLocal = true;
    if (params.localAudioTrackData) {
      this.localAudio = new HMSLocalAudioTrack(params.localAudioTrackData);
    }
    if (params.localVideoTrackData) {
      this.localVideo = new HMSLocalVideoTrack(params.localVideoTrackData);
    }
  }
}
