import {getMeetingCode, getMeetingUrl} from '../../utils/functions';
import ActionTypes from '../actionTypes';

const INITIAL_STATE = {
  userName: '',
  roomLink: getMeetingUrl(),
  roomCode: getMeetingCode(),
  hmsLocalPeer: null,
  hmsInstance: null,
};

const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ActionTypes.SAVE_USER_DATA:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.CLEAR_HMS_INSTANCE:
      return {
        ...state,
        hmsInstance: null,
      };
    default:
      return state;
  }
};

export default userReducer;
