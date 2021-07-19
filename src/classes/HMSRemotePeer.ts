import type HMSAudioTrack from './HMSAudioTrack';
import HMSPeer from './HMSPeer';
import type HMSTrack from './HMSTrack';
import type HMSVideoTrack from './HMSVideoTrack';

export default class HMSRemotePeer extends HMSPeer {
  remoteAudioTrack?: Function;
  remoteVideoTrack?: Function;

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
    super(params);
    this.isLocal = false;
  }
}
