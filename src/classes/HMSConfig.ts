export class HMSConfig {
  username: string;
  authToken: string;
  endpoint?: string;
  metadata?: string;

  constructor(params: {
    username: string;
    authToken: string;
    endpoint?: string;
    metadata?: string;
  }) {
    this.username = params.username;
    this.authToken = params.authToken;
    this.endpoint = params.endpoint;
    this.metadata = params.metadata;
  }
}
