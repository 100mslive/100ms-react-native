export class HMSMessage {
  // endpoint: string;
  public message: string;
  public type: string;
  public time?: string;
  public sender?: string;

  constructor(params: {
    message: string;
    type: string;
    time?: string;
    sender?: string;
  }) {
    this.message = params.message;
    this.type = params.type;
    this.time = params.time;
    this.sender = params.sender;
  }
}
