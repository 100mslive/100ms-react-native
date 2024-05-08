import type { HMSPeer } from '../HMSPeer';

export interface HMSWhiteboard {
  id: string;

  title?: string;

  owner?: HMSPeer;

  isOwner?: boolean;

  isAdmin?: boolean;

  isOpen: boolean;

  url?: string;
}
