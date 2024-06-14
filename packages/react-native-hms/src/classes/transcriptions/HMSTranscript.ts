export interface HMSTranscript {
  transcript: string;

  peerId: string;

  end: Date;

  start: Date;

  isFinal: boolean;
}
