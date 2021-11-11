export class HMSConfig {
  // endpoint: string;
  username: string;
  authToken: string;
  endpoint?: string;

  constructor(params: {
    username: string;
    authToken: string;
    endpoint?: string;
  }) {
    this.username = params.username;
    this.authToken = params.authToken;
    this.endpoint = params.endpoint;
  }
}
