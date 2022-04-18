import type {HMSPeer, HMSVideoTrack} from '@100mslive/react-native-hms';

export type PeerTrackNode = {
  id: string;
  peer: HMSPeer;
  track?: HMSVideoTrack;
};
export type Peer = {
  ref?: HMSPeer;
  isAudioMute: boolean;
  isVideoMute: boolean;
  name: string;
  type: TrackType;
};

export enum LayoutParams {
  AUDIO = 'audio',
  GRID = 'grid',
  ACTIVE_SPEAKER = 'active speaker',
  HERO = 'hero',
  DEFAULT = '',
}

export enum TrackType {
  LOCAL = 'local',
  REMOTE = 'remote',
  SCREEN = 'screen',
  DEFAULT = '',
}

export enum ModalTypes {
  ROLE_CHANGE = 'roleChange',
  CHANGE_TRACK = 'changeTrackState',
  CHANGE_NAME = 'changeName',
  HLS_STREAMING = 'hlsStreaming',
  RECORDING = 'recording',
  LAYOUT = 'layout',
  LEAVE = 'leave',
  SETTINGS = 'settings',
  CHAT = 'chat',
  ZOOM = 'zoom',
  ROLE = 'role',
  DEFAULT = '',
}
