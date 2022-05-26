import {PeerTrackNode} from '../../utils/types';
import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

type IntialStateType = {
  audioState: boolean;
  videoState: boolean;
  peerState: PeerTrackNode[];
};

const INITIAL_STATE: IntialStateType = {
  audioState: true,
  videoState: true,
  peerState: [],
};

const appReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SET_AUDIO_VIDEO_STATE:
      return {...state, ...action.payload};
    case ActionTypes.SET_PEER_STATE:
      return {...state, ...action.payload};
    case ActionTypes.CLEAR_PEER_DATA.REQUEST:
      return {...state, peerState: []};
    default:
      return state;
  }
};

export default appReducer;
