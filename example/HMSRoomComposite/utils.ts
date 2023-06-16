const DEFAULT_JOINING_CONFIG = {
  usePrebuilt: true,
  mutedAudio: true,
  mutedVideo: true,
  mirrorCamera: true,
  skipPreview: false,
  audioMixer: false, // IOS only
  musicMode: false, // IOS only
  softwareDecoder: true, // Android only
  autoResize: false, // Android only
  autoSimulcast: true,
  showStats: false,
};

export const getJoinConfig = () => {
  if (!global.joinConfig) {
    global.joinConfig = DEFAULT_JOINING_CONFIG;
  }

  return global.joinConfig;
};
