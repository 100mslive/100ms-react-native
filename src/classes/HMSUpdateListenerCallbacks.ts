import type { HMSAudioDevice } from './HMSAudioDevice';
import type { HMSChangeTrackStateRequest } from './HMSChangeTrackStateRequest';
import type { HMSException } from './HMSException';
import type { HMSLocalAudioStats } from './HMSLocalAudioStats';
import type { HMSLocalAudioTrack } from './HMSLocalAudioTrack';
import type { HMSLocalVideoStats } from './HMSLocalVideoStats';
import type { HMSLocalVideoTrack } from './HMSLocalVideoTrack';
import type { HMSMessage } from './HMSMessage';
import type { HMSPeer } from './HMSPeer';
import type { HMSPeerUpdate } from './HMSPeerUpdate';
import type { HMSRTCStatsReport } from './HMSRTCStatsReport';
import type { HMSRemoteAudioStats } from './HMSRemoteAudioStats';
import type { HMSRemoteAudioTrack } from './HMSRemoteAudioTrack';
import type { HMSRemoteVideoStats } from './HMSRemoteVideoStats';
import type { HMSRemoteVideoTrack } from './HMSRemoteVideoTrack';
import type { HMSRoleChangeRequest } from './HMSRoleChangeRequest';
import type { HMSRoom } from './HMSRoom';
import type { HMSRoomUpdate } from './HMSRoomUpdate';
import type { HMSSpeaker } from './HMSSpeaker';
import type { HMSTrack } from './HMSTrack';
import type { HMSTrackUpdate } from './HMSTrackUpdate';
import type { HMSUpdateListenerActions } from './HMSUpdateListenerActions';

export interface HMSUpdateListenerCallbacks {
  [HMSUpdateListenerActions.ON_PREVIEW]: (data: { room: HMSRoom; previewTracks: HMSTrack[]; }) => void;
  [HMSUpdateListenerActions.ON_JOIN]: (data: { room: HMSRoom }) => void;
  [HMSUpdateListenerActions.ON_ROOM_UPDATE]: (data: { room: HMSRoom; type: HMSRoomUpdate; }) => void;
  [HMSUpdateListenerActions.ON_PEER_UPDATE]: (data: { peer: HMSPeer; type: HMSPeerUpdate; }) => void;
  [HMSUpdateListenerActions.ON_TRACK_UPDATE]: (data: { peer: HMSPeer; track: HMSTrack; type: HMSTrackUpdate; }) => void;
  [HMSUpdateListenerActions.ON_ERROR]: (error: HMSException) => void;
  [HMSUpdateListenerActions.ON_MESSAGE]: (message: HMSMessage) => void;
  [HMSUpdateListenerActions.ON_SPEAKER]: (data: HMSSpeaker[]) => void;
  [HMSUpdateListenerActions.RECONNECTING]: (data: { error: HMSException }) => void;
  [HMSUpdateListenerActions.RECONNECTED]: () => void;
  [HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST]: (request: HMSRoleChangeRequest) => void;
  [HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST]: (request: HMSChangeTrackStateRequest) => void;
  [HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM]: (data: any) => void; // HMSLeaveRoomRequest not found
  [HMSUpdateListenerActions.ON_RTC_STATS]: (data: { rtcStats: HMSRTCStatsReport; }) => void;
  [HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS]: (data: { localAudioStats: HMSLocalAudioStats; track: HMSLocalAudioTrack; peer: HMSPeer; }) => void;
  [HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS]: (data: { localVideoStats: HMSLocalVideoStats; track: HMSLocalVideoTrack; peer: HMSPeer; }) => void;
  [HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS]: (data: { remoteAudioStats: HMSRemoteAudioStats; track: HMSRemoteAudioTrack; peer: HMSPeer; }) => void;
  [HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS]: (data: { remoteVideoStats: HMSRemoteVideoStats; track: HMSRemoteVideoTrack; peer: HMSPeer; }) => void;
  [HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED]: (data: { device: HMSAudioDevice; audioDevicesList: HMSAudioDevice[]; }) => void;
}
