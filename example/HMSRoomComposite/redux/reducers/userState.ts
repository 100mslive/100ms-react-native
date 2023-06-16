import type {
  HMSRole,
  HMSSDK,
  HMSSessionStore,
} from '@100mslive/react-native-hms';
import {getMeetingCode, getMeetingUrl} from '../../utils/functions';
import ActionTypes, {HmsStateActionTypes} from '../actionTypes';

type ActionType = {
  payload: any;
  type: String;
};

type IntialStateType = {
  userName: string;
  userId: string | undefined;
  endPoints: {init: string; token: string} | undefined;
  debugInfo: boolean;
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
  userId: undefined,
  endPoints: undefined,
  debugInfo: false,
  hmsInstance: undefined,
  roomID: getMeetingUrl(),
  roomCode: getMeetingCode(),
  isHLSFlow: true,
  roles: [],
  hmsSessionStore: null,
  spotlightTrackId: null,
};

const userReducer = (
  state = INITIAL_STATE,
  action: ActionType,
): IntialStateType => {
  switch (action.type) {
    case ActionTypes.SAVE_USER_DATA.REQUEST:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.SET_HMS_INSTANCE:
      return {
        ...state,
        hmsInstance: action.payload.hmsInstance,
      };
    case ActionTypes.CLEAR_HMS_INSTANCE:
      return {
        ...state,
        hmsInstance: undefined,
        hmsSessionStore: null,
        spotlightTrackId: null,
      };
    case HmsStateActionTypes.SET_PREBUILT_DATA:
      // if (action.payload.options) {
      //   return {
      //     ...state,
      //     roomCode: action.payload.roomCode,
      //     userName: action.payload.options.userName ?? '',
      //     userId: action.payload.options.userId,
      //     endPoints: action.payload.options.endPoints,
      //     debugInfo: action.payload.options.debugInfo ?? false,
      //   };
      // }
      // return {
      //   ...state,
      //   roomCode: action.payload.roomCode,
      // };

      state.roomCode = action.payload.roomCode;
      state.userName = action.payload.options.userName ?? '';
      state.userId = action.payload.options.userId;
      state.endPoints = action.payload.options.endPoints;
      state.debugInfo = action.payload.options.debugInfo ?? false;

      return state;
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default userReducer;
