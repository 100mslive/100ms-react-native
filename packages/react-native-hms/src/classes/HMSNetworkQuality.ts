/**
 * Represents the network quality of a connection in the HMS (100ms) system.
 *
 * This class encapsulates the network quality information, specifically focusing on the downlink quality of the connection.
 * The downlink quality is represented as a numerical value, providing a quantifiable measure of the receiving end's network performance.
 *
 * @param {Object} params - The constructor parameters.
 * @param {number} params.downlinkQuality - The downlink quality of the network connection.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/network-quality
 */
export class HMSNetworkQuality {
  downlinkQuality: number;

  constructor(params: { downlinkQuality: number }) {
    this.downlinkQuality = params.downlinkQuality;
  }
}
