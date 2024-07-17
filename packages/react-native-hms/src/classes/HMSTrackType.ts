/**
 * Enum for HMS Track Types.
 *
 * This enumeration defines the types of tracks that can be handled within the HMS (100ms) system, specifically distinguishing between audio and video tracks.
 * - `AUDIO`: Represents an audio track, typically containing sound or voice data.
 * - `VIDEO`: Represents a video track, typically containing visual data from a camera or other video sources.
 */
export enum HMSTrackType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}
