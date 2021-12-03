import type { HMSPeer } from './HMSPeer';
import type { HMSRtmpStreamingState } from './HMSRtmpStreamingState';
import type { HMSServerRecordingState } from './HMSServerRecordingState';
import type { HMSBrowserRecordingState } from './HMSBrowserRecordingState';

export class HMSRoom {
  id: string;
  name: string;
  metaData?: string;
  peers: HMSPeer[];
  browserRecordingState: HMSBrowserRecordingState;
  rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
  serverRecordingState: HMSServerRecordingState;

  constructor(params: {
    id: string;
    name: string;
    metaData?: string;
    peers: HMSPeer[];
    browserRecordingState: HMSBrowserRecordingState;
    rtmpHMSRtmpStreamingState: HMSRtmpStreamingState;
    serverRecordingState: HMSServerRecordingState;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.metaData = params.metaData;
    this.peers = params.peers;
    this.browserRecordingState = params.browserRecordingState;
    this.rtmpHMSRtmpStreamingState = params.rtmpHMSRtmpStreamingState;
    this.serverRecordingState = params.serverRecordingState;
  }
}
