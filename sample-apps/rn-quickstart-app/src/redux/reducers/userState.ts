import type {HMSLocalPeer, HMSPeer, HMSSDK} from '@100mslive/react-native-hms';

import {getMeetingCode, getMeetingUrl} from '../../utils/functions';
import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

type IntialStateType = {
  userName: string;
  roomLink: string;
  hmsInstance: HMSSDK | null;
  hmsLocalPeer: HMSLocalPeer | null;
  roomCode: string;
};

const INITIAL_STATE: IntialStateType = {
  userName: '',
  roomLink: getMeetingUrl(),
  roomCode: getMeetingCode(),
  hmsLocalPeer: null,
  hmsInstance: null,
};

const userReducer = (state = INITIAL_STATE, action: ActionType) => {
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
