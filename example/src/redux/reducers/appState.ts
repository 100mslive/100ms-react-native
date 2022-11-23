import ActionTypes from '../actionTypes';
import type {PeerTrackNode} from '../../utils/types';
import {PipModes} from '../../utils/types';

type ActionType = {
  payload: {[key: string] : any};
  type: String;
};

type IntialStateType = {
  peerState: PeerTrackNode[];
  pipModeStatus: PipModes;
};

const INITIAL_STATE: IntialStateType = {
  peerState: [],
  pipModeStatus: PipModes.INACTIVE,
};

const appReducer = (state = INITIAL_STATE, action: ActionType): IntialStateType => {
  switch (action.type) {
    case ActionTypes.CHANGE_PIP_MODE_STATUS:
      return {...state, pipModeStatus: action.payload.pipModeStatus}
    case ActionTypes.SET_PEER_STATE:
      return {...state, ...action.payload};
    case ActionTypes.CLEAR_PEER_DATA.REQUEST:
      return {...state, peerState: []};
    default:
      return state;
  }
};

export default appReducer;
