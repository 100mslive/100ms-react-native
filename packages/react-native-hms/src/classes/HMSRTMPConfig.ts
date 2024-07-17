import type { HMSRtmpVideoResolution } from './HMSRtmpVideoResolution';

/**
 * Configuration class for RTMP streaming in the HMS (100ms) system.
 *
 * This class encapsulates the settings required to configure RTMP (Real-Time Messaging Protocol) streaming for a meeting.
 * It includes options for the meeting URL, RTMP URLs for streaming, whether recording should be enabled, and the video resolution for the stream.
 *
 * @param {Object} params - The constructor parameters.
 * @param {string} [params.meetingURL] - The URL of the meeting to be streamed. Optional.
 * @param {Array<string>} [params.rtmpURLs] - An array of RTMP URLs to which the meeting will be streamed. Optional.
 * @param {boolean} params.record - Flag indicating whether the stream should be recorded.
 * @param {HMSRtmpVideoResolution} [params.resolution] - The resolution of the video to be streamed. Optional.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/recording
 */
export class HMSRTMPConfig {
  meetingURL?: string;
  rtmpURLs?: Array<string>;
  record: boolean;
  resolution?: HMSRtmpVideoResolution;

  constructor(params: {
    meetingURL?: string;
    rtmpURLs?: Array<string>;
    record: boolean;
    resolution?: HMSRtmpVideoResolution;
  }) {
    this.meetingURL = params.meetingURL;
    this.rtmpURLs = params.rtmpURLs;
    this.record = params.record;
    this.resolution = params.resolution;
  }
}
