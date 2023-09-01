import type { HMSMessageRecipient } from './HMSMessageRecipient';
import type { HMSPeer } from './HMSPeer';

export class HMSMessage {
  public message: string;
  public messageId: string;
  public type: string;
  public time: Date;
  public sender?: HMSPeer;
  public recipient: HMSMessageRecipient;

  constructor(params: {
    message: string;
    messageId: string;
    type: string;
    time: Date;
    sender?: HMSPeer;
    recipient: HMSMessageRecipient;
  }) {
    this.message = params.message;
    this.messageId = params.messageId;
    this.type = params.type;
    this.time = params.time;
    this.sender = params.sender;
    this.recipient = params.recipient;
  }
}
