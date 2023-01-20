import type { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSNetworkQuality } from './HMSNetworkQuality';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSVideoTrack } from './HMSVideoTrack';

export class HMSPeer {
  peerID: string;
  name: string;
  isLocal?: boolean;
  customerUserID?: string;

  /*
   * @deprecated customerDescription has been deprecated in favor of metadata
   */
  customerDescription?: string;
  metadata?: string;
  role?: HMSRole;
  networkQuality?: HMSNetworkQuality;
  audioTrack?: HMSAudioTrack;
  videoTrack?: HMSVideoTrack;
  auxiliaryTracks?: HMSTrack[];

  constructor(params: {
    peerID: string;
    name: string;
    isLocal?: boolean;
    customerUserID?: string;
    customerDescription?: string;
    metadata?: string;
    role?: HMSRole;
    networkQuality?: HMSNetworkQuality;
    audioTrack?: HMSAudioTrack;
    videoTrack?: HMSVideoTrack;
    auxiliaryTracks?: HMSTrack[];
  }) {
    this.peerID = params.peerID;
    this.name = params.name;
    this.isLocal = params.isLocal;
    this.customerUserID = params.customerUserID;
    this.customerDescription = params.customerDescription;
    this.audioTrack = params.audioTrack;
    this.videoTrack = params.videoTrack;
    this.auxiliaryTracks = params.auxiliaryTracks;
    this.role = params.role;
    this.networkQuality = params.networkQuality;
    this.metadata = params.metadata;
  }
}
