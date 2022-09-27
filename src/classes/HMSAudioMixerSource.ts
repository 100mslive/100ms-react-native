import type { HMSAudioNode } from './HMSAudioNode';

export class HMSAudioMixerSource {
  node: HMSAudioNode[];

  constructor(params: { node: HMSAudioNode[] }) {
    this.node = params.node;
  }

  toList(): string[] {
    const nodeName: string[] = [];
    this.node.forEach((audioNode) => nodeName.push(audioNode.toString()));
    return nodeName;
  }
}
