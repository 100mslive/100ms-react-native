import HMSPeer from './HMSPeer';

export default class HMSRemotePeer extends HMSPeer {
  constructor() {
    super();
    this.isLocal = false;
  }
}
