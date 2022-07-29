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
  CHANGE_ROLE_ACCEPT = 'changeRoleAccept',
  SWITCH_AUDIO_OUTPUT = 'switchAudioOutput',
  CHANGE_AUDIO_MODE = 'changeAudioMode',
  CHANGE_ROLE = 'changeRole',
  CHANGE_TRACK = 'changeTrackState',
  CHANGE_NAME = 'changeName',
  HLS_STREAMING = 'hlsStreaming',
  RECORDING = 'recording',
  RESOLUTION = 'resolution',
  RTC_STATS = 'rtcStats',
  LAYOUT = 'layout',
  SORTING = 'sorting',
  LEAVE_MENU = 'leaveMenu',
  LEAVE_ROOM = 'leaveRoom',
  END_ROOM = 'endRoom',
  SETTINGS = 'settings',
  CHAT = 'chat',
  ZOOM = 'zoom',
  ROLE = 'role',
  PREVIEW = 'preview',
  PARTICIPANTS = 'participants',
  VOLUME = 'volume',
  DEFAULT = '',
}

export enum SortingType {
  ALPHABETICAL = 'Alphabetical Order',
  VIDEO_ON = 'Video On',
  ROLE_PRIORITY = 'Role Priority',
  DEFAULT = '',
}

export enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
}
