import type { HMSPeer, HMSVideoTrack } from '@100mslive/react-native-hms';

export type PeerTrackNode = {
  id: string;
  peer: HMSPeer;
  track?: HMSVideoTrack;
  isDegraded?: boolean;
  // TODO: isDegraded should not be optional
};

export enum LayoutParams {
  AUDIO = 'audio',
  GRID = 'grid',
  ACTIVE_SPEAKER = 'active speaker',
  HERO = 'hero',
  MINI = 'mini',
  HLS = 'hls',
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
  CHANGE_TRACK_ROLE = 'changeTrackStateRole',
  CHANGE_NAME = 'changeName',
  HLS_STREAMING = 'hlsStreaming',
  END_HLS_STREAMING = 'endHlsStreaming',
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
  PREVIEW = 'preview',
  PARTICIPANTS = 'participants',
  AUDIO_MIXING_MODE = 'audioMixingMode',
  SET_AUDIO_SHARE_VOLUME = 'setAudioShareVolume',
  WELCOME_SETTINGS = 'welcomeSettings',
  BULK_ROLE_CHANGE = 'bulkRoleChange',
  PEER_SETTINGS = 'peerSettings',
  STREAMING_QUALITY_SETTING = 'streamingQualitySetting',
  HLS_PLAYER_ASPECT_RATIO = 'hlsPlayerAspectRatio',
  DEFAULT = '',
}

export enum SortingType {
  ALPHABETICAL = 'Alphabetical Order',
  VIDEO_ON = 'Video On',
  ROLE_PRIORITY = 'Role Priority',
  DEFAULT = 'None',
}

export enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
}

export enum PipModes {
  NOT_AVAILABLE = -1,
  ACTIVE = 0,
  INACTIVE = 1,
}

export enum Constants {
  MEET_URL = 'MEET_URL',
}

export type HMSIOSScreenShareConfig = {
  appGroup: string;
  preferredExtension: string;
};

export const SUPPORTED_ASPECT_RATIOS = [
  { value: 16 / 9, id: '16:9' },
  { value: 9 / 16, id: '9:16' },
  { value: 1, id: '1:1' },
  { value: 4 / 3, id: '4:3' },
  { value: 3 / 4, id: '3:4' },
];
