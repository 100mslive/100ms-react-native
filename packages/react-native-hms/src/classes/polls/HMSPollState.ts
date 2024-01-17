export enum HMSPollState {
  /**
   The poll is created but not started yet.
   */
  created,

  /**
   The poll has started and is currently active.
   */
  started,

  /**
   The poll has been stopped and is no longer active.
   */
  stopped,
}

// Web Interface -
// export enum HMSPollStates {
//   CREATED = 'created',
//   STARTED = 'started',
//   STOPPED = 'stopped',
// }
