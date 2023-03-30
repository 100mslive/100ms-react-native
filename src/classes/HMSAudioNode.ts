export class HMSAudioNode {
  name: string;
  sdkId: string = '12345';

  constructor(name: string) {
    this.name = name;
  }

  toString(): string {
    return this.name;
  }
}
