import type {HMSPeer, HMSVideoTrack} from '@100mslive/react-native-hms';

export type PeerTrackNode = {
  id: string;
  peer: HMSPeer;
  track?: HMSVideoTrack;
};

export enum LayoutParams {
  AUDIO = 'audio',
  GRID = 'grid',
  ACTIVE_SPEAKER = 'active speaker',
  HERO = 'hero',
  MINI = 'mini',
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
  SORTING = 'sorting',
  LEAVE = 'leave',
  SETTINGS = 'settings',
  CHAT = 'chat',
  ZOOM = 'zoom',
  ROLE = 'role',
  DEFAULT = '',
}

export enum SortingType {
  ALPHABETICAL = 'alphabetical',
  DEFAULT = '',
}
