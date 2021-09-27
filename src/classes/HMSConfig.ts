export default class HMSConfig {
  // endpoint: string;
  username: string;
  authToken: string;
  roomID: string;
  userID?: string;
  endpoint?: string;

  constructor(params: {
    username: string;
    roomID: string;
    authToken: string;
    userID?: string;
    endpoint?: string;
  }) {
    this.roomID = params.roomID;
    this.username = params.username;
    this.authToken = params.authToken;
    this.userID = params.userID;
    this.endpoint = params.endpoint;
  }
}
