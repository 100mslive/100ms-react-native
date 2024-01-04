import actionTypes from '../actionTypes';

export const resetJoinConfig = () => ({ type: actionTypes.RESET_JOIN_CONFIG });

export const changeDebugMode = (value: boolean) => ({
  type: actionTypes.CHANGE_DEBUG_INFO,
  payload: { debugMode: value },
});

export const changeJoinAudioMuted = (value: boolean) => ({
  type: actionTypes.CHANGE_JOIN_AUDIO_MUTED,
  payload: { mutedAudio: value },
});

export const changeJoinVideoMuted = (value: boolean) => ({
  type: actionTypes.CHANGE_JOIN_VIDEO_MUTED,
  payload: { mutedVideo: value },
});

export const changeMirrorCamera = (value: boolean) => ({
  type: actionTypes.CHANGE_MIRROR_CAMERA,
  payload: { mirrorCamera: value },
});

export const changeJoinSkipPreview = (value: boolean) => ({
  type: actionTypes.CHANGE_JOIN_SKIP_PREVIEW,
  payload: { skipPreview: value },
});

export const changeAudioMixer = (value: boolean) => ({
  type: actionTypes.CHANGE_AUDIO_MIXER,
  payload: { audioMixer: value },
});

export const changeMusicMode = (value: boolean) => ({
  type: actionTypes.CHANGE_MUSIC_MODE,
  payload: { musicMode: value },
});

export const changeSoftwareDecoder = (value: boolean) => ({
  type: actionTypes.CHANGE_SOFTWARE_DECODER,
  payload: { softwareDecoder: value },
});

export const changeAutoResize = (value: boolean) => ({
  type: actionTypes.CHANGE_AUTO_RESIZE,
  payload: { autoResize: value },
});

export const changeAutoSimulcast = (value: boolean) => ({
  type: actionTypes.CHANGE_AUTO_SIMULCAST,
  payload: { autoSimulcast: value },
});

export const changeUseStaticUserId = (value: boolean) => ({
  type: actionTypes.CHANGE_USE_STATIC_USERID,
  payload: { staticUserId: value },
});
