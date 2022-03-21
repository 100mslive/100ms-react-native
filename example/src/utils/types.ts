import {HMSTrack, HMSPeer} from '@100mslive/react-native-hms';

type Peer = {
  peerRefrence?: HMSPeer;
  trackId?: string;
  name: string;
  isAudioMute: boolean;
  isVideoMute: boolean;
  id?: string;
  colour: string;
  sink: boolean;
  type: 'local' | 'remote' | 'screen';
  metadata?: {
    isHandRaised: boolean;
    isBRBOn: boolean;
  };
  track?: HMSTrack;
};

type LayoutParams = 'audio' | 'normal' | 'active speaker';

export type {Peer, LayoutParams};
