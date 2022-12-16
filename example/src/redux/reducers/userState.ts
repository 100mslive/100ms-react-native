import type {HMSRole, HMSSDK} from '@100mslive/react-native-hms';
import {getMeetingCode, getMeetingUrl} from '../../utils/functions';
import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

type IntialStateType = {
  userName: string;
  roomID: string;
  hmsInstance?: HMSSDK;
  roomCode: string;
  isHLSFlow: boolean;
  roles: HMSRole[];
};

const INITIAL_STATE: IntialStateType = {
  userName: '',
  roomID: getMeetingUrl(),
  roomCode: getMeetingCode(),
  isHLSFlow: true,
  roles: [],
};

const userReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SAVE_USER_DATA.REQUEST:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.CLEAR_HMS_INSTANCE:
      return {
        ...state,
        hmsInstance: undefined,
      };
    default:
      return state;
  }
};

export default userReducer;
