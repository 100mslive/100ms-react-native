export default class HMSConfig {
  // endpoint: string;
  username?: string;
  authToken?: string;
  roomID?: string;
  userID?: string;
  constructor(params?: {
    username?: string;
    roomID?: string;
    authToken?: string;
    userID?: string;
  }) {
    if (params) {
      this.roomID = params.roomID;
      this.username = params.username;
      this.authToken = params.authToken;
      this.userID = params.userID;
    }
  }
}
