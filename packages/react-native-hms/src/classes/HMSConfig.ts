/**
 * Represents the configuration needed to join a room in the HMS ecosystem.
 *
 * This class encapsulates all necessary details required to initiate a connection to a room, including user identification,
 * authentication token, optional endpoint for different server connections, metadata for additional information about the connection,
 * and a flag to capture network quality during the preview phase.
 *
 * For more information, checkout Join Room docs here
 * {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/join}
 *
 * @param {Object} params - The configuration parameters.
 * @param {string} params.username - The username of the participant.
 * @param {string} params.authToken - The authentication token for room access.
 * @param {string} [params.endpoint] - Optional. The endpoint URL for the connection.
 * @param {string} [params.metadata] - Optional. Additional metadata associated with the Local Peer.
 * @param {boolean} [params.captureNetworkQualityInPreview] - Optional. Flag to capture network quality in the preview phase.
 */
export class HMSConfig {
  username: string;
  authToken: string;
  endpoint?: string;
  metadata?: string;
  captureNetworkQualityInPreview?: boolean;

  constructor(params: {
    username: string;
    authToken: string;
    endpoint?: string;
    metadata?: string;
    captureNetworkQualityInPreview?: boolean;
  }) {
    this.username = params.username;
    this.authToken = params.authToken;
    this.endpoint = params.endpoint;
    this.metadata = params.metadata;
    this.captureNetworkQualityInPreview = params.captureNetworkQualityInPreview;
  }
}
