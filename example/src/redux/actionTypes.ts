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

const SET_PEER_STATE = 'SET_PEER_STATE';

const CLEAR_PEER_DATA = createRequests('CLEAR_PEER_DATA');

const SAVE_USER_DATA = createRequests('SAVE_USER_DATA');

const CLEAR_HMS_INSTANCE = 'CLEAR_HMS_INSTANCE';

export default {
  ADD_MESSAGE,
  CLEAR_MESSAGE_DATA,
  CLEAR_PEER_DATA,
  SET_PEER_STATE,
  SAVE_USER_DATA,
  CLEAR_HMS_INSTANCE,
};
