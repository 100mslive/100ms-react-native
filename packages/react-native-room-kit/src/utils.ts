// @ts-nocheck

const DEFAULT_JOINING_CONFIG = {
  mutedAudio: true,
  mutedVideo: true,
  skipPreview: false,
  audioMixer: false, // iOS only
  musicMode: false, // iOS only
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
