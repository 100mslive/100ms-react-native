import type HMSAudioTrack from './HMSAudioTrack';
import type HMSTrack from './HMSTrack';
import type HMSVideoTrack from './HMSVideoTrack';

export default class HMSPeer {
  peerID: string;
  name: string;
  isLocal?: boolean;
  customerUserID?: string;
  customerDescription?: string;

  audioTrack?: HMSAudioTrack;
  videoTrack?: HMSVideoTrack;

  auxiliaryTracks?: [HMSTrack];

  constructor(params: {
    peerID: string;
    name: string;
    isLocal?: boolean;
    customerUserID?: string;
    customerDescription?: string;
    audioTrack?: HMSAudioTrack;
    videoTrack?: HMSVideoTrack;
    auxiliaryTracks?: [HMSTrack];
  }) {
    this.peerID = params.peerID;
    this.name = params.name;
    this.isLocal = params.isLocal;
    this.customerUserID = params.customerUserID;
    this.customerDescription = params.customerDescription;
    this.audioTrack = params.audioTrack;
    this.videoTrack = params.videoTrack;
    this.auxiliaryTracks = params.auxiliaryTracks;
  }
}
