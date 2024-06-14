import type { OnTranscriptionError } from './OnTranscriptionError';
import type { TranscriptionState } from './TranscriptionState';
import type { TranscriptionsMode } from './TranscriptionsMode';

export interface Transcriptions {
  error?: OnTranscriptionError;

  mode?: TranscriptionsMode;

  state?: TranscriptionState;

  initialisedAt?: Date;

  startedAt?: Date;

  stoppedAt?: Date;

  updatedAt?: Date;
}
