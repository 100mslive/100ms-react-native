const createRequests = (base: String) => {
  const statusObject = {
    REQUEST: `${base}_REQUEST`,
    SUCCESS: `${base}_SUCCESS`,
    FAILED: `${base}_FAILED`,
  };
  return statusObject;
};

const ADD_MESSAGE = createRequests('ADD_MESSAGE');

const CLEAR_MESSAGE_DATA = createRequests('CLEAR_MESSAGE_DATA');

const SET_AUDIO_VIDEO_STATE = 'SET_AUDIO_VIDEO_STATE';

const SAVE_USER_DATA = createRequests('SAVE_USER_DATA');

const UPDATE_HMS_INSTANCE = 'UPDATE_HMS_INSTANCE';

export default {
  ADD_MESSAGE,
  CLEAR_MESSAGE_DATA,
  SET_AUDIO_VIDEO_STATE,
  SAVE_USER_DATA,
  UPDATE_HMS_INSTANCE,
};
