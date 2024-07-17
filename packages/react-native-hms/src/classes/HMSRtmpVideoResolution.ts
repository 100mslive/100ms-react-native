/**
 * Represents the video resolution for RTMP streaming in the HMS (100ms) system.
 *
 * This class encapsulates the dimensions (height and width) of the video resolution to be used for RTMP streaming.
 * It allows for specifying the video quality by defining the resolution, which is crucial for optimizing the streaming experience
 * based on the bandwidth available and the requirements of the streaming platform.
 *
 * @param {Object} params - The constructor parameters.
 * @param {number} params.height - The height of the video resolution.
 * @param {number} params.width - The width of the video resolution.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/recording
 */
export class HMSRtmpVideoResolution {
  height: number;
  width: number;

  constructor(params: { height: number; width: number }) {
    this.height = params.height;
    this.width = params.width;
  }
}
