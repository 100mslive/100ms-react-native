import type {HMSTrack, HMSPeer} from '@100mslive/react-native-hms';

type Peer = {
  peerReference?: HMSPeer;
  trackId?: string;
  name: string;
  isAudioMute: boolean;
  isVideoMute: boolean;
  id?: string;
  colour: string;
  type: 'local' | 'remote' | 'screen';
  metadata?: {
    isHandRaised?: boolean;
    isBRBOn?: boolean;
  };
  track?: HMSTrack;
};

type LayoutParams = 'audio' | 'grid' | 'active speaker' | 'hero' | 'mini';

// eslint-disable-next-line no-undef
export type {Peer, LayoutParams};
