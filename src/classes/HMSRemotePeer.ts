import HMSPeer from './HMSPeer';
import type HMSTrack from './HMSTrack';

export default class HMSRemotePeer extends HMSPeer {
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
    super(params);
    this.isLocal = false;
  }
}
