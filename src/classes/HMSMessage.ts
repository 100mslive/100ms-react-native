export default class HMSMessage {
  // endpoint: string;
  public sender: string;
  public message: string;
  public type: string;
  public time: string;

  constructor(params: {
    sender: string;
    message: string;
    type: string;
    time: string;
  }) {
    this.sender = params.sender;
    this.message = params.message;
    this.type = params.type;
    this.time = params.time;
  }
}
