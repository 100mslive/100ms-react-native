/**
 * Defines the structure for HLS (HTTP Live Streaming) timed metadata.
 *
 * This interface is used to represent metadata that can be synchronized with HLS video playback.
 * The metadata includes a payload, which is the content of the metadata, and a duration, specifying how long (in seconds)
 * the metadata should be displayed during the stream.
 * This can be used for a variety of purposes such as displaying song titles, advertisements, or other relevant information at specific times during the stream.
 *
 * @interface HMSHLSTimedMetadata
 * @property {string} payload - The content of the metadata to be displayed.
 * @property {number} duration - The duration (in seconds) for which the metadata should be displayed.
 */
export interface HMSHLSTimedMetadata {
  payload: string;
  duration: number;
}
