import { HMSPeer } from './HMSPeer';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';
import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import { HMSLocalAudioTrack } from './HMSLocalAudioTrack';
import { HMSLocalVideoTrack } from './HMSLocalVideoTrack';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSTrackSource } from './HMSTrackSource';

export class HMSLocalPeer extends HMSPeer {
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
    localAudioTrackData?: {
      id: string;
      trackId: string;
      source?: HMSTrackSource;
      trackDescription?: string;
      isMute?: boolean;
      settings?: HMSAudioTrackSettings;
      type: HMSTrackType;
    };
    localVideoTrackData?: {
      id: string;
      trackId: string;
      source?: HMSTrackSource;
      trackDescription?: string;
      isMute?: boolean;
      settings?: HMSVideoTrackSettings;
      type: HMSTrackType;
    };
  }) {
    super(params);
    if (params.localAudioTrackData) {
      this.localAudio = new HMSLocalAudioTrack(params.localAudioTrackData);
    }
    if (params.localVideoTrackData) {
      this.localVideo = new HMSLocalVideoTrack(params.localVideoTrackData);
    }
  }
}
