import type { HMSAudioTrack } from './HMSAudioTrack';
import { HMSPeer } from './HMSPeer';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';
import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import { HMSLocalAudioTrack } from './HMSLocalAudioTrack';
import { HMSLocalVideoTrack } from './HMSLocalVideoTrack';
import type { HMSRole } from './HMSRole';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSNetworkQuality } from './HMSNetworkQuality';

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
    name: string;
    isLocal?: boolean;
    customerUserID?: string;
    customerDescription?: string;
    metadata?: string;
    audioTrack?: HMSAudioTrack;
    videoTrack?: HMSVideoTrack;
    networkQuality?: HMSNetworkQuality;
    role?: HMSRole;
    auxiliaryTracks?: HMSTrack[];
    localAudioTrackData?: {
      id: string;
      trackId: string;
      source?: number | string;
      trackDescription?: string;
      isMute?: boolean;
      settings?: HMSAudioTrackSettings;
      type: HMSTrackType;
    };
    localVideoTrackData?: {
      id: string;
      trackId: string;
      source?: number | string;
      trackDescription?: string;
      isMute?: boolean;
      settings?: HMSVideoTrackSettings;
      type: HMSTrackType;
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
