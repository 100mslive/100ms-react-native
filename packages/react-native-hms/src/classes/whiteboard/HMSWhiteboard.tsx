import type { HMSPeer } from '../HMSPeer';
import type { HMSWhiteboardState } from './HMSWhiteboardState';

export interface HMSWhiteboard {
  id: string;

  title?: string;

  state: HMSWhiteboardState;

  isOwner: boolean;

  owner?: HMSPeer;

  url?: string;
}
