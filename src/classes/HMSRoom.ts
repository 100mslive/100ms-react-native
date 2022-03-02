import type { HMSPeer } from './HMSPeer';
import type { HMSRtmpStreamingState } from './HMSRtmpStreamingState';
import type { HMSServerRecordingState } from './HMSServerRecordingState';
import type { HMSBrowserRecordingState } from './HMSBrowserRecordingState';
import type { HMSHLSStreamingState } from './HMSHLSStreamingState';

export class HMSRoom {
  id: string;
  name: string;
  metaData?: string;
  peers: HMSPeer[];
  browserRecordingState: HMSBrowserRecordingState;
  rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
  serverRecordingState: HMSServerRecordingState;
  hlsStreamingState: HMSHLSStreamingState;
  peerCount: number;

  constructor(params: {
    id: string;
    name: string;
    metaData?: string;
    peers: HMSPeer[];
    browserRecordingState: HMSBrowserRecordingState;
    rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
    serverRecordingState: HMSServerRecordingState;
    hlsStreamingState: HMSHLSStreamingState;
    peerCount: number;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.metaData = params.metaData;
    this.peers = params.peers;
    this.browserRecordingState = params.browserRecordingState;
    this.rtmpHMSRtmpStreamingState = params.rtmpHMSRtmpStreamingState;
    this.serverRecordingState = params.serverRecordingState;
    this.hlsStreamingState = params.hlsStreamingState;
    this.peerCount = params.peerCount;
  }
}
