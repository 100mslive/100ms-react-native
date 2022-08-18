import type {HMSMessage, HMSSDK} from '@100mslive/react-native-hms';
import type {PeerTrackNode} from '../../utils/types';
import actionTypes from '../actionTypes';

export const addMessage = (data: HMSMessage) => ({
  type: actionTypes.ADD_MESSAGE.REQUEST,
  payload: data,
});

export const clearMessageData = () => ({
  type: actionTypes.CLEAR_MESSAGE_DATA.REQUEST,
});

export const setPeerState = (data: {peerState: PeerTrackNode[]}) => ({
  type: actionTypes.SET_PEER_STATE,
  payload: data,
});

export const clearPeerData = () => ({
  type: actionTypes.CLEAR_PEER_DATA.REQUEST,
});

export const saveUserData = (data: {
  userName?: String;
  roomID?: String;
  mirrorLocalVideo?: boolean;
  roomCode?: String;
  hmsInstance?: HMSSDK;
  isHLSFlow?: boolean;
}) => ({
  type: actionTypes.SAVE_USER_DATA.REQUEST,
  payload: data,
});

export const clearHmsReference = () => ({
  type: actionTypes.CLEAR_HMS_INSTANCE,
});
