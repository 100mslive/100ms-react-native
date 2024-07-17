/**
 * Enum for HMS Track Source types.
 *
 * Defines the source of an HMS track, indicating whether the track originates from a plugin, is a regular track, or is a screen-sharing track.
 *
 * @enum {string}
 * @property {string} REGULAR - Represents a regular track, typically from a user's camera or microphone.
 * @property {string} SCREEN - Represents a track that shares the screen.
 * @property {string} PLUGIN - Represents a track sourced from a plugin.
 */
export enum HMSTrackSource {
  PLUGIN = 'plugin',
  REGULAR = 'regular',
  SCREEN = 'screen',
}
