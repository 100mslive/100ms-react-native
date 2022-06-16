import ActionTypes from '../actionTypes';
import type {PeerTrackNode} from '../../utils/types';

type ActionType = {
  payload: Object;
  type: String;
};

type IntialStateType = {
  peerState: PeerTrackNode[];
};

const INITIAL_STATE: IntialStateType = {
  peerState: [],
};

const appReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SET_PEER_STATE:
      return {...state, ...action.payload};
    case ActionTypes.CLEAR_PEER_DATA.REQUEST:
      return {...state, peerState: []};
    default:
      return state;
  }
};

export default appReducer;
