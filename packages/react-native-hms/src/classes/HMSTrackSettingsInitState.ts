/**
 * Enum for the initial state of tracks in a 100ms (HMS) application.
 *
 * This enumeration defines the initial mute state for tracks (audio or video) in a 100ms (HMS) application.
 * It allows developers to specify whether a track should start in a muted or unmuted state, providing control over the user's media state upon joining a Room.
 *
 * @enum {string}
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/join#join-with-muted-audio-video
 */
export enum HMSTrackSettingsInitState {
  /** Represents the state where the track is initially muted. */
  MUTED = 'MUTED',
  /** Represents the state where the track is initially unmuted. */
  UNMUTED = 'UNMUTED',
}
