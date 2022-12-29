import type {HMSPeer, HMSVideoTrack} from '@100mslive/react-native-hms';

export type PeerTrackNode = {
  id: string;
  peer: HMSPeer;
  track?: HMSVideoTrack;
  isDegraded: boolean;
};

export enum ModalTypes {
  LEAVE_ROOM = 'leaveRoom',
  DEFAULT = '',
}

export enum Constants {
  MEET_URL = 'MEET_URL',
}
