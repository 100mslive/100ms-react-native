import type {
  HMSRole,
  HMSSDK,
  HMSSessionStore,
} from '@100mslive/react-native-hms';
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
  hmsSessionStore?: HMSSessionStore | null;
  spotlightTrackId?: string | null;
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
  hmsSessionStore: null,
  spotlightTrackId: null,
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
        hmsSessionStore: null,
        spotlightTrackId: null,
      };
    default:
      return state;
  }
};

export default userReducer;
