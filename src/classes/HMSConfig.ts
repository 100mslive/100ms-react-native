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
