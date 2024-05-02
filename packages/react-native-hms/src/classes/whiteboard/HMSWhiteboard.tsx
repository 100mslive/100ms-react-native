import type { HMSPeer } from '../HMSPeer';
import type { HMSWhiteboardState } from './HMSWhiteboardState';

export interface HMSWhiteboard {
  id: string;

  title?: string;

  owner?: HMSPeer;

  isOwner?: boolean;

  isAdmin?: boolean;

  isOpen: boolean;

  url?: string;

  state: HMSWhiteboardState;

  // PermissionType
}
