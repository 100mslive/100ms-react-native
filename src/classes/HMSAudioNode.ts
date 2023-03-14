import { HMSConstants } from "./HMSConstants";

export class HMSAudioNode {
  name: string;
  sdkId: string = HMSConstants.DEFAULT_SDK_ID;

  constructor(name: string) {
    this.name = name;
  }

  toString(): string {
    return this.name;
  }
}
