import type { HMSPeer } from './HMSPeer';

export class HMSRoom {
  id: string;
  name: string;
  metaData?: string;
  peers: HMSPeer[];

  constructor(params: {
    id: string;
    name: string;
    metaData?: string;
    peers: HMSPeer[];
  }) {
    this.id = params.id;
    this.name = params.name;
    this.metaData = params.metaData;
    this.peers = params.peers;
  }
}
