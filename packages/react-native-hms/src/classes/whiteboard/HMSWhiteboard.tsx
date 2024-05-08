import type { HMSPeer } from '../HMSPeer';

export interface HMSWhiteboard {
  id: string;

  title?: string;

  owner?: HMSPeer;

  url?: string;
}
