import type HmsManager from '@100mslive/react-native-hms';
import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

type IntialStateType = {
  userName?: string;
  roomID?: string;
  hmsInstance?: HmsManager;
  roomCode?: string;
  mirrorLocalVideo: boolean;
};

const INITIAL_STATE: IntialStateType = {
  userName: undefined,
  roomID: undefined,
  roomCode: undefined,
  hmsInstance: undefined,
  mirrorLocalVideo: false,
};

const userReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SAVE_USER_DATA.REQUEST:
      return {
        ...state,
        ...action.payload,
      };
    case ActionTypes.UPDATE_HMS_INSTANCE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
