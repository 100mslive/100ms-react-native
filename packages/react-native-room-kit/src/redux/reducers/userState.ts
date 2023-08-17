import type {
  HMSRole,
  HMSSDK,
  HMSSessionStore,
} from '@100mslive/react-native-hms';
import { getMeetingCode, getMeetingUrl } from '../../utils/functions';
import ActionTypes, { HmsStateActionTypes } from '../actionTypes';
import type { HMSIOSScreenShareConfig } from '../../utils/types';

type ActionType = {
  payload: any;
  type: String;
};

type IntialStateType = {
  userName: string;
  userId: string | undefined;
  endPoints: { init: string; token: string } | undefined;
  debugMode: boolean;
  roomID: string;
  hmsInstance?: HMSSDK;
  hmsSessionStore?: HMSSessionStore | null;
  spotlightTrackId?: string | null;
  roomCode: string;
  isHLSFlow: boolean;
  roles: HMSRole[];
  iosBuildConfig: HMSIOSScreenShareConfig | null;
  onLeave: (() => void) | undefined;
};

const INITIAL_STATE: IntialStateType = {
  userName: '',
  userId: undefined,
  endPoints: undefined,
  debugMode: false,
  hmsInstance: undefined,
  roomID: getMeetingUrl(),
  roomCode: getMeetingCode(),
  isHLSFlow: true,
  roles: [],
  hmsSessionStore: null,
  spotlightTrackId: null,
  iosBuildConfig: null,
  onLeave: undefined,
};

const userReducer = (
  state = INITIAL_STATE,
  action: ActionType
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
    case HmsStateActionTypes.SET_USER_NAME:
      return {
        ...state,
        userName: action.payload.userName,
      };
    case HmsStateActionTypes.SET_PREBUILT_DATA:
      state.roomCode = action.payload.roomCode;
      state.userName = action.payload.options.userName ?? '';
      state.userId = action.payload.options.userId;
      state.endPoints = action.payload.options.endPoints;
      state.debugMode = action.payload.options.debugMode ?? false;
      state.iosBuildConfig = action.payload.options.ios ?? null;
      state.onLeave = action.payload.onLeave;

      return state;
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default userReducer;
