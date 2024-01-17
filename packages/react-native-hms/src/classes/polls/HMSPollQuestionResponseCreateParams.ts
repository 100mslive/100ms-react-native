import type { HMSPollQuestionResponse } from './HMSPollQuestionResponse';

export type HMSPollQuestionResponseCreateParams = Omit<
  HMSPollQuestionResponse,
  'type' | 'peer' | 'update' | 'responseFinal'
>;
