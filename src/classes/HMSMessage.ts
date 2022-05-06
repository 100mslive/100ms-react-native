import type { HMSMessageRecipient } from './HMSMessageRecipient';
import type { HMSPeer } from './HMSPeer';

export class HMSMessage {
  // endpoint: string;
  public message: string;
  public type: string;
  public time: Date;
  public sender: HMSPeer;
  public recipient: HMSMessageRecipient;

  constructor(params: {
    message: string;
    type: string;
    time: string;
    sender: HMSPeer;
    recipient: HMSMessageRecipient;
  }) {
    this.message = params.message;
    this.type = params.type;
    this.time = new Date(parseInt(params.time));
    this.sender = params.sender;
    this.recipient = params.recipient;
  }
}
