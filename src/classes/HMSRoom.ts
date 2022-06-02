import type { HMSPeer } from './HMSPeer';
import type { HMSRtmpStreamingState } from './HMSRtmpStreamingState';
import type { HMSServerRecordingState } from './HMSServerRecordingState';
import type { HMSBrowserRecordingState } from './HMSBrowserRecordingState';
import type { HMSHLSStreamingState } from './HMSHLSStreamingState';
import type { HMSHLSRecordingState } from './HMSHLSRecordingState';

export class HMSRoom {
  id: string;
  sessionId: string;
  name: string;
  metaData?: string;
  peers: HMSPeer[];
  browserRecordingState: HMSBrowserRecordingState;
  rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
  serverRecordingState: HMSServerRecordingState;
  hlsStreamingState: HMSHLSStreamingState;
  hlsRecordingState?: HMSHLSRecordingState;
  peerCount: number;

  constructor(params: {
    id: string;
    sessionId: string;
    name: string;
    metaData?: string;
    peers: HMSPeer[];
    browserRecordingState: HMSBrowserRecordingState;
    rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
    serverRecordingState: HMSServerRecordingState;
    hlsStreamingState: HMSHLSStreamingState;
    hlsRecordingState?: HMSHLSRecordingState;
    peerCount: number;
  }) {
    this.id = params.id;
    this.sessionId = params.sessionId;
    this.name = params.name;
    this.metaData = params.metaData;
    this.peers = params.peers;
    this.browserRecordingState = params.browserRecordingState;
    this.rtmpHMSRtmpStreamingState = params.rtmpHMSRtmpStreamingState;
    this.serverRecordingState = params.serverRecordingState;
    this.hlsStreamingState = params.hlsStreamingState;
    this.hlsRecordingState = params.hlsRecordingState;
    this.peerCount = params.peerCount;
  }
}
