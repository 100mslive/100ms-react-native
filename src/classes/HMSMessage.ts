import type { HMSMessageRecipient } from './HMSMessageRecipient';
import type { HMSMessageType } from './HMSMessageType';
import type { HMSPeer } from './HMSPeer';

export class HMSMessage {
  // endpoint: string;
  public message: string;
  public type: HMSMessageType;
  public time: Date;
  public sender?: HMSPeer;
  public recipient: HMSMessageRecipient;

  constructor(params: {
    message: string;
    type: HMSMessageType;
    time: Date;
    sender?: HMSPeer;
    recipient: HMSMessageRecipient;
  }) {
    this.message = params.message;
    this.type = params.type;
    this.time = params.time;
    this.sender = params.sender;
    this.recipient = params.recipient;
  }
}
