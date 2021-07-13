import HMSPeer from './HMSPeer';

export default class HMSLocalPeer extends HMSPeer {
  constructor() {
    super();
    this.isLocal = true;
  }
}
