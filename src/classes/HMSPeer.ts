import type HMSTrack from './HMSTrack';

export default class HMSPeer {
  peerID: string;
  name: string;
  isLocal?: boolean;
  customerUserID?: string;
  customerDescription?: string;

  audioTrack?: HMSTrack;
  videoTrack?: HMSTrack;

  auxiliaryTracks?: [HMSTrack];

  constructor(params: {
    peerID: string;
    name: string;
    isLocal?: boolean;
    customerUserID?: string;
    customerDescription?: string;
    audioTrack?: HMSTrack;
    videoTrack?: HMSTrack;
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
