export default class HMSMessage {
  // endpoint: string;
  public message: string;
  public type: string;
  public time: string;

  constructor(params: { message: string; type: string; time: string }) {
    this.message = params.message;
    this.type = params.type;
    this.time = params.time;
  }
}
