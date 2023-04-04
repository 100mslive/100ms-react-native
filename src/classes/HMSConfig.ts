export class HMSConfig {
  username: string;
  authToken: string;
  metadata?: string;
  captureNetworkQualityInPreview?: boolean;

  constructor(params: {
    username: string;
    authToken: string;
    metadata?: string;
    captureNetworkQualityInPreview?: boolean;
  }) {
    this.username = params.username;
    this.authToken = params.authToken;
    this.metadata = params.metadata;
    this.captureNetworkQualityInPreview = params.captureNetworkQualityInPreview;
  }
}
