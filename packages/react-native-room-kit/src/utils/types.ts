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
  ZOOM = 'zoom',
  PREVIEW = 'preview',
  CHAT_AND_PARTICIPANTS = 'chat_and_participants',
  AUDIO_MIXING_MODE = 'audioMixingMode',
  SET_AUDIO_SHARE_VOLUME = 'setAudioShareVolume',
  WELCOME_SETTINGS = 'welcomeSettings',
  BULK_ROLE_CHANGE = 'bulkRoleChange',
  PEER_SETTINGS = 'peerSettings',
  STREAMING_QUALITY_SETTING = 'streamingQualitySetting',
  HLS_PLAYER_ASPECT_RATIO = 'hlsPlayerAspectRatio',
  STOP_RECORDING = 'stopRecording',
  CHAT_FILTER = 'chatFilter',
  CHAT_MORE_ACTIONS = 'chatMoreActions',
  MESSAGE_OPTIONS = 'messageOptions',
  POLLS_AND_QUIZZES = 'pollsAndQuizzes',
  VIRTUAL_BACKGROUND = 'virtualBackground',
  CLOSED_CAPTIONS_CONTROL = 'closedCaptionsControl',
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

export type OnLeaveHandler = (reason: OnLeaveReason) => void;

export const SUPPORTED_ASPECT_RATIOS = [
  { value: 16 / 9, id: '16:9' },
  { value: 9 / 16, id: '9:16' },
  { value: 1, id: '1:1' },
  { value: 4 / 3, id: '4:3' },
  { value: 3 / 4, id: '3:4' },
];

export enum MaxTilesInOnePage {
  IN_PORTRAIT_WITH_SCREENSHARES = 2,
  IN_PORTRAIT = 6,
  IN_LANDSCAPE = 2,
}

export const ChatBottomSheetTabs = ['Chat', 'Participants'] as const;

export const ChatBroadcastFilter = { name: 'everyone' } as const;

export const PeerListRefreshInterval = 5000; // in milliseconds

export enum OnLeaveReason {
  /**
   * User left the meeting room by pressing the "Leave" or "End Stream" button in Leave Modal
   */
  LEAVE = 'leave',
  /**
   * User was removed from the meeting room by another HMSPeer
   */
  PEER_KICKED = 'peer_kicked',
  /**
   * Meeting Room was ended by user or another HMSPeer
   */
  ROOM_END = 'room_ended',
  /**
   * Due to network issues, user left the meeting room
   */
  NETWORK_ISSUES = 'network_issues',
  /**
   * User left the meeting room by pressing the "end" button in PIP window
   */
  PIP = 'pip',
}

export const TerminalExceptionCodes = [
  4005,
  1003,
  2000,
  '4005',
  '1003',
  '2000',
];

export const HeaderFooterHideDelayMs = 5000;
