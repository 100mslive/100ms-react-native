import type { HMSPeer } from '../HMSPeer';

export interface HMSTranscript {
  transcript: string;

  peer: HMSPeer;

  end: number;

  start: number;

  isFinal: boolean;
}
