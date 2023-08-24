// @ts-nocheck

const DEFAULT_JOINING_CONFIG = {
  mutedAudio: false,
  mutedVideo: false,
  skipPreview: false,
  audioMixer: false, // IOS only
  musicMode: false, // IOS only
  softwareDecoder: true, // Android only
  autoResize: false, // Android only
};

let config = DEFAULT_JOINING_CONFIG;

export const getJoinConfig = (): typeof DEFAULT_JOINING_CONFIG => {
  if (
    typeof global.joinConfig === 'object' &&
    global.joinConfig.mutedAudio !== undefined
  ) {
    config = global.joinConfig;
  }

  return config;
};

export enum NotificationTypes {
  ROLE_CHANGE_DECLINED = 'role_change_declined',
  HAND_RAISE = 'hand_raise',
  LOCAL_SCREENSHARE = 'local_screenshare',
};
