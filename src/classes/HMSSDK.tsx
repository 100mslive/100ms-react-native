import React from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  ViewStyle,
  AppState,
} from 'react-native';
import { HMSUpdateListenerActions } from './HMSUpdateListenerActions';
import type { HMSConfig } from './HMSConfig';
import type { HMSLocalPeer } from './HMSLocalPeer';
import type { HMSRemotePeer } from './HMSRemotePeer';
import type { HMSRoom } from './HMSRoom';
import type { HMSRole } from './HMSRole';
import { HMSEncoder } from './HMSEncoder';
import { HMSMessage } from './HMSMessage';
import { HMSHelper } from './HMSHelper';
import type { HMSTrack } from './HMSTrack';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSLogger } from './HMSLogger';
import type { HMSPeer } from './HMSPeer';
import { HmsView as HMSViewComponent } from './HmsView';
import type { HMSVideoViewMode } from './HMSVideoViewMode';
import type { HMSTrackSettings } from './HMSTrackSettings';
import type { HMSRTMPConfig } from './HMSRTMPConfig';
import type { HMSHLSConfig } from './HMSHLSConfig';
import { HMSLocalAudioStats } from './HMSLocalAudioStats';
import { HMSLocalVideoStats } from './HMSLocalVideoStats';
import { HMSRemoteVideoStats } from './HMSRemoteVideoStats';
import { HMSRemoteAudioStats } from './HMSRemoteAudioStats';

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
  mirror?: boolean;
  scaleType?: HMSVideoViewMode;
  screenshot?: boolean;
  id?: string | null;
  setZOrderMediaOverlay?: boolean;
}

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

const HmsEventEmitter = new NativeEventEmitter(HmsManager);

let HmsSdk: HMSSDK | undefined;

let logger: HMSLogger | undefined;

export class HMSSDK {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  remotePeers?: HMSRemotePeer[];
  knownRoles?: HMSRole[];
  id: string;
  private muteStatus: boolean | undefined;
  appStateSubscription?: any;

  onPreviewDelegate?: any;
  onJoinDelegate?: any;
  onRoomDelegate?: any;
  onPeerDelegate?: any;
  onTrackDelegate?: any;
  onErrorDelegate?: any;
  onMessageDelegate?: any;
  onSpeakerDelegate?: any;
  onReconnectingDelegate?: any;
  onReconnectedDelegate?: any;
  onRoleChangeRequestDelegate?: any;
  onChangeTrackStateRequestDelegate?: any;
  onRemovedFromRoomDelegate?: any;
  onRtcStatsDelegate?: any;
  onLocalAudioStatsDelegate?: any;
  onLocalVideoStatsDelegate?: any;
  onRemoteAudioStatsDelegate?: any;
  onRemoteVideoStatsDelegate?: any;

  constructor(id: string) {
    this.id = id;
  }

  /**
   * - Returns an instance of [HMSSDK]{@link HMSSDK}
   * - This function must be called to get an instance of HMSSDK class and only then user can interact with its methods.
   *
   * @static
   * @returns
   * @memberof HMSSDK
   */
  static async build(params?: { trackSettings: HMSTrackSettings }) {
    let id = await HmsManager.build(params?.trackSettings || {});
    HmsSdk = new HMSSDK(id);
    HmsSdk.attachPreviewListener();
    HmsSdk.attachListeners();
    return HmsSdk;
  }

  /**
   * - Returns the instance of logger which can be used to manipulate log levels.
   * @returns @instance HMSLogger
   * @memberof HMSSDK
   */
  static getLogger() {
    return logger;
  }

  /**
   * - Updates the logger for this instance of HMSSDK
   * @param {HMSLogger} hmsLogger
   * @memberof HMSSDK
   */
  setLogger = (hmsLogger: HMSLogger) => {
    logger = hmsLogger;
    hmsLogger.verbose('#Function setLogger', { id: this.id });
  };

  /**
   * - Calls removeListeners that in turn breaks all connections with native listeners.
   *
   * @memberof HMSSDK
   */
  destroy = () => {
    this.removeListeners();
  };

  /**
   * - Attaches preview listener for native callbacks.
   * Note:this function connects sdk to native side and not app to sdk.
   *
   * @memberof HMSSDK
   */
  attachPreviewListener = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      this.onPreviewListener
    );
  };

  /**
   * - Attaches all the listeners to native callbacks.
   * Note: this function connects sdk to native side and not app to sdk.
   * @memberof HMSSDK
   */
  attachListeners = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_JOIN,
      this.onJoinListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      this.onRoomListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      this.onPeerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      this.onTrackListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ERROR,
      this.onErrorListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      this.onMessageListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      this.onSpeakerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTING,
      this.reconnectingListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTED,
      this.reconnectedListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      this.onRoleChangeRequestListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      this.onChangeTrackStateRequestListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      this.onRemovedFromRoomListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_RTC_STATS,
      this.RTCStatsListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
      this.onLocalAudioStatsListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
      this.onLocalVideoStatsListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
      this.onRemoteAudioStatsListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
      this.onRemoteVideoStatsListener
    );
  };

  /**
   * Disconnects all the listeners of this sdk from native listeners.
   * Note: this function is only called from destroy function and should only be called when the current instance of {@link HMSSDK} is not required anymore.
   * @memberof HMSSDK
   */
  removeListeners = () => {
    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_JOIN,
      this.onJoinListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      this.onRoomListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      this.onPeerListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      this.onTrackListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_ERROR,
      this.onErrorListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      this.onMessageListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      this.onSpeakerListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.RECONNECTING,
      this.reconnectingListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.RECONNECTED,
      this.reconnectedListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
      this.onRoleChangeRequestListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
      this.onChangeTrackStateRequestListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
      this.onRemovedFromRoomListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_RTC_STATS,
      this.RTCStatsListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
      this.onLocalAudioStatsListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
      this.onLocalVideoStatsListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
      this.onRemoteAudioStatsListener
    );

    HmsEventEmitter.removeListener(
      HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
      this.onRemoteVideoStatsListener
    );
  };

  /**
   * takes an instance of [HMSConfig]{@link HMSConfig} and joins the room.
   * after joining the room user will start receiving the events and updates of the room.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/join} for more info
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  join = async (config: HMSConfig) => {
    logger?.verbose('#Function join', { config, id: this.id });
    this.addAppStateListener();
    await HmsManager.join({ ...config, id: this.id });
  };

  /**
   * - preview function is used to initiate a preview for the localPeer.
   * - We can call this function and wait for a response in previewListener, the response will contain previewTracks for local peer.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/preview} for more info
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  preview = (config: HMSConfig) => {
    logger?.verbose('#Function preview', { config, id: this.id });
    HmsManager.preview({ ...config, id: this.id });
  };

  /**
   * - previewForRole can be used when there is role change request for current localPeer and we want
   * to show the localPeer how the tracks look before publishing them to room.
   *
   * - It requires a role of type [HMSRole]{@link HMSRole} for which we want to preview the tracks.
   *
   * checkout {@link https://www.100ms.live/docs/react-native} for more info
   *
   * @param {HMSRole}
   * @memberof HMSSDK
   */
  previewForRole = async (role: HMSRole) => {
    logger?.verbose('#Function previewForRole', {
      role,
      id: this.id,
    });
    if (Platform.OS === 'ios') {
      return await HmsManager.previewForRole({ role: role?.name, id: this.id });
    } else {
      console.log('API currently not available for android');
      return 'API currently not available for android';
    }
  };

  /**
   * - HmsView is react component that takes one track and starts showing that track on a tile.
   * - The appearance of tile is completely customizable with style prop.
   * - setting sink true or false for a video tile will add or remove sink for a video.
   * - scale type can determine how the incoming video will fit in the canvas check {@link HMSVideoViewMode} for more information.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/render-video} for more info
   *
   * @param {HmsComponentProps}
   * @memberof HMSSDK
   */
  HmsView = ({
    sink,
    trackId,
    style,
    mirror,
    scaleType,
    screenshot,
    setZOrderMediaOverlay,
  }: HmsComponentProps) => {
    return (
      <HMSViewComponent
        sink={sink}
        trackId={trackId}
        style={style}
        setZOrderMediaOverlay={setZOrderMediaOverlay}
        mirror={mirror}
        scaleType={scaleType}
        id={this.id}
        screenshot={screenshot}
      />
    );
  };

  /**
   * Calls leave function of native sdk and session of current user is invalidated.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/leave} for more info
   *
   * @memberof HMSSDK
   */
  leave = async () => {
    logger?.verbose('#Function leave', { id: this.id });
    const data = {
      id: this.id,
    };

    const op = await HmsManager.leave(data);
    this.muteStatus = undefined;
    this.localPeer = undefined;
    this.remotePeers = undefined;
    this.room = undefined;
    this.knownRoles = undefined;
    this?.appStateSubscription?.remove();
    return op;
  };

  /**
   * - This function sends message to all the peers in the room, the get the message in onMessage listener.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/chat} for more info
   *
   * @param {message: string} and @param {type: string}
   * @memberof HMSSDK
   */
  sendBroadcastMessage = async (message: string, type: string = 'chat') => {
    logger?.verbose('#Function sendBroadcastMessage', {
      message,
      type: type || null,
      id: this.id,
    });
    return await HmsManager.sendBroadcastMessage({
      message,
      type: type || null,
      id: this.id,
    });
  };

  /**
   * - sendGroupMessage sends a message to specific set of roles, whoever has any of those role in room
   * will get the message in onMessage listener.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/chat} for more info
   *
   * @memberof HMSSDK
   */
  sendGroupMessage = async (
    message: string,
    roles: HMSRole[],
    type: string = 'chat'
  ) => {
    logger?.verbose('#Function sendGroupMessage', {
      message,
      roles,
      id: this.id,
      type: type || null,
    });
    return await HmsManager.sendGroupMessage({
      message,
      roles: HMSHelper.getRoleNames(roles),
      id: this.id,
      type: type || null,
    });
  };

  /**
   * - sendDirectMessage sends a private message to a single peer, only that peer will get the message
   * in onMessage Listener.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/chat} for more info
   *
   * @memberof HMSSDK
   */
  sendDirectMessage = async (
    message: string,
    peer: HMSPeer,
    type: string = 'chat'
  ) => {
    logger?.verbose('#Function sendDirectMessage', {
      message,
      peerId: peer.peerID,
      id: this.id,
      type: type || null,
    });
    return await HmsManager.sendDirectMessage({
      message,
      peerId: peer.peerID,
      id: this.id,
      type: type || null,
    });
  };

  /**
   * - changeMetadata changes a specific field in localPeer which is [metadata] it is a string that can
   * be used for various functionalities like raiseHand, beRightBack and many more that explains the
   * current status of the peer.
   *
   * - it is advised to use a json object in string format to store multiple dataPoints in metadata.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-metadata} for more info
   *
   * @param {string}
   * @memberof HMSSDK
   */
  changeMetadata = (metadata: string) => {
    logger?.verbose('#Function changeMetadata', { metadata, id: this.id });
    HmsManager.changeMetadata({ metadata, id: this.id });
  };

  /**
   * - startRTMPOrRecording takes a configuration object {@link HMSRTMPConfig} and stats the RTMP recording
   * - this object of {@link HMSRTMPConfig} sets the urls for streaming and weather to set recording on or not
   * - we get the response of this function in onRoomUpdate as RTMP_STREAMING_STATE_UPDATED.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/recording} for more info
   *
   * @memberof HMSSDK
   */
  startRTMPOrRecording = async (data: HMSRTMPConfig) => {
    logger?.verbose('#Function startRTMPOrRecording', {
      ...data,
      id: this.id,
    });

    const op = await HmsManager.startRTMPOrRecording({ ...data, id: this.id });
    return op;
  };

  /**
   * - this function stops all the ongoing RTMP streaming and recording.
   * - we get the response of this function in onRoomUpdate as RTMP_STREAMING_STATE_UPDATED.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/recording} for more info
   *
   * @memberof HMSSDK
   */
  stopRtmpAndRecording = async () => {
    logger?.verbose('#Function stopRtmpAndRecording', {});
    const op = await HmsManager.stopRtmpAndRecording({ id: this.id });
    return op;
  };

  /**
   * - This function starts HLSStreaming.
   * - we get the response of this function in onRoomUpdate as HLS_STREAMING_STATE_UPDATED.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/hls-streaming} for more info
   *
   * @param {HMSHLSConfig}
   * @memberof HMSSDK
   */
  startHLSStreaming = async (data: HMSHLSConfig) => {
    logger?.verbose('#Function startHLSStreaming', {
      ...data,
      id: this.id,
    });
    return await HmsManager.startHLSStreaming({ ...data, id: this.id });
  };

  /**
   * - stopHLSStreaming function stops the ongoing HLSStreams.
   * - we get the response of this function in onRoomUpdate as HLS_STREAMING_STATE_UPDATED.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/hls-streaming} for more info
   *
   * @memberof HMSSDK
   */
  stopHLSStreaming = async () => {
    logger?.verbose('#Function stopHLSStreaming', {});
    return await HmsManager.stopHLSStreaming({ id: this.id });
  };

  /**
   * - This function can be used in a situation when we want to change role hence manipulate their
   * access and rights in the current room, it takes the peer {@link HMSPeer} whom role we want to change,
   * role {@link HMSRole} which will be the new role for that peer and weather to forcefully change
   * the role or ask the to accept the role change request using a boolean force.
   *
   * - if we change the role forcefully the peer's role will be updated without asking the peer
   * otherwise the user will get the roleChangeRequest in roleChangeRequest listener.
   * for more information on this checkout {@link onRoleChangeRequestListener}
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-role} for more info
   *
   * @memberof HMSSDK
   */
  changeRole = async (peer: HMSPeer, role: HMSRole, force: boolean = false) => {
    const data = {
      peerId: peer?.peerID,
      role: role?.name,
      force: force,
      id: this.id,
    };
    logger?.verbose('#Function changeRole', data);
    return await HmsManager.changeRole(data);
  };

  /**
   * - This function can be used to manipulate mute status of any track.
   * - Targeted peer affected by this action will get a callback in {@link onChangeTrackStateRequestListener}.
   *
   * * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-track-state} for more info
   *
   * @param {HMSTrack}
   * @memberof HMSSDK
   */
  changeTrackState = async (track: HMSTrack, mute: boolean) => {
    logger?.verbose('#Function changeTrackState', {
      track,
      mute,
      id: this.id,
    });
    const data = {
      trackId: track.trackId,
      mute,
      id: this.id,
    };

    return await HmsManager.changeTrackState(data);
  };

  /**
   * - changeTrackStateForRoles is an enhancement on the functionality of {@link changeTrackState}.
   * - We can change mute status for all the tracks of peers having a particular role.
   * - @param source determines the source of the track ex. video, audio etc.
   * - The peers affected by this action will get a callback in {@link onChangeTrackStateRequestListener}.
   *
   * @memberof HMSSDK
   */
  changeTrackStateForRoles = async (
    mute: boolean,
    type?: HMSTrackType,
    source?: string,
    roles?: Array<HMSRole>
  ) => {
    let roleNames = null;
    if (roles) {
      roleNames = HMSHelper.getRoleNames(roles);
    }
    logger?.verbose('#Function changeTrackStateRoles', {
      source,
      mute,
      type,
      roles,
      id: this.id,
    });
    const data = {
      source,
      mute,
      type,
      roles: roleNames,
      id: this.id,
    };

    return await HmsManager.changeTrackStateForRoles(data);
  };

  /**
   * - removePeer can forcefully disconnect a Peer from the room.
   * - the user who's removed from this action will get a callback in {@link onRemovedFromRoomListener}.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/remove-peer} for more info
   *
   * @memberof HMSSDK
   */
  removePeer = async (peer: HMSPeer, reason: string) => {
    logger?.verbose('#Function removePeer', {
      peerId: peer.peerID,
      reason,
      id: this.id,
    });
    const data = {
      peerId: peer.peerID,
      reason,
      id: this.id,
    };

    return await HmsManager.removePeer(data);
  };

  /**
   * - endRoom can be used in a situation where we want to disconnect all the peers from current room
   * and end the call.
   * - everyone in the room will get an update of this action in {@link onRemovedFromRoomListener}.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/end-room} for more info
   *
   * @memberof HMSSDK
   */
  endRoom = async (reason: string, lock: boolean = false) => {
    logger?.verbose('#Function endRoom', { lock, reason, id: this.id });
    const data = {
      lock,
      reason,
      id: this.id,
    };

    return await HmsManager.endRoom(data);
  };

  /**
   * - This function can be used to change name of localPeer.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-name} for more info
   *
   * @memberof HMSSDK
   */
  changeName = async (name: string) => {
    logger?.verbose('#Function changeName', { name, id: this.id });
    const data = {
      name,
      id: this.id,
    };

    return await HmsManager.changeName(data);
  };

  /**
   * - Calling this function will accept the most recent roleChange request made by anyone in the room
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-role} for more info
   *
   * @memberof HMSSDK
   */
  acceptRoleChange = async () => {
    logger?.verbose('#Function acceptRoleChange', { id: this.id });
    return await HmsManager.acceptRoleChange({ id: this.id });
  };

  /**
   * - setPlaybackForAllAudio is an extension of the abilities of {@link setPlaybackAllowed} in
   * {@link HMSRemoteAudioTrack}, it sets mute status for all peers in the room
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/playback-allowed} for more info
   *
   * @memberof HMSSDK
   */
  setPlaybackForAllAudio = (mute: boolean) => {
    logger?.verbose('#Function setPlaybackForAllAudio', { mute, id: this.id });
    this.muteStatus = mute;
    HmsManager.setPlaybackForAllAudio({ mute, id: this.id });
  };

  /**
   * - This function mutes audio for all peers in the room.
   *
   * @memberof HMSSDK
   */
  remoteMuteAllAudio = () => {
    logger?.verbose('#Function remoteMuteAllAudio', { id: this.id });
    HmsManager.remoteMuteAllAudio({ id: this.id });
  };

  /**
   * - getRoom is a wrapper function on an existing native function also known as getRoom the returns
   * current room object which is of type {@link HMSRoom}
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/room} for more info
   *
   * @memberof HMSSDK
   * @return HMSRoom
   */
  getRoom = async () => {
    logger?.verbose('#Function getRoom', {
      roomID: this.room?.id,
      id: this.id,
    });
    const hmsRoom = await HmsManager.getRoom({ id: this.id });

    const encodedHmsRoom = HMSEncoder.encodeHmsRoom(hmsRoom, this.id);
    return encodedHmsRoom;
  };

  /**
   * - This function sets the volume of any peer in the room
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/set-volume} for more info
   *
   * @memberof HMSSDK
   */
  setVolume = (track: HMSTrack, volume: number) => {
    logger?.verbose('#Function setVolume', {
      track,
      volume,
      id: this.id,
    });
    HmsManager.setVolume({
      id: this.id,
      trackId: track.trackId,
      volume,
    });
  };

  resetVolume = () => {
    logger?.verbose('#Function resetVolume', { id: this.id });
    if (Platform.OS === 'android') HmsManager.resetVolume({ id: this.id });
  };

  /**
   * - This is a temporary solution for the situation when mic access is taken from the app and
   * user returns to the app with no mic access. It will re-acquire the mic by setting the volume
   * from native side
   *
   * @memberof HMSSDK
   */
  addAppStateListener = () => {
    logger?.verbose('#Function addAppStateListener', { id: this.id });
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (nextAppState === 'active' && Platform.OS === 'android') {
          this.resetVolume();
        }
      }
    );
  };

  /**
   * - This function is used to start screenshare, currently available only for android
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/screenshare} for more info
   *
   * @memberof HMSSDK
   */
  startScreenshare = async () => {
    logger?.verbose('#Function startScreenshare', { id: this.id });
    if (Platform.OS === 'android') {
      return await HmsManager.startScreenshare({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - Returns a boolean stating if the screen is currently shared or not
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/screenshare} for more info
   *
   * @memberof HMSSDK
   */
  isScreenShared = async () => {
    logger?.verbose('#Function isScreenShared', { id: this.id });
    if (Platform.OS === 'android') {
      return await HmsManager.isScreenShared({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - stops the screenShare, currently available for android only.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/screenshare} for more info
   *
   * @memberof HMSSDK
   */
  stopScreenshare = async () => {
    logger?.verbose('#Function stopScreenshare', { id: this.id });
    if (Platform.OS === 'android') {
      return await HmsManager.stopScreenshare({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - enableRTCStats sets a boolean in native side which in turn allows several events to be passed
   * through the bridge these events are {@link RTCStatsListener}, {@link onRemoteVideoStatsListener},
   * {@link onRemoteAudioStatsListener}, {@link onLocalAudioStatsListener} and {@link onLocalVideoStatsListener}
   *
   * - These listeners get various dataPoints for current peers and their connectivity to the room
   * such as jitter, latency etc.
   *
   * - currently available for iOS only
   *
   * @memberof HMSSDK
   */
  enableRTCStats = () => {
    logger?.verbose('#Function enableRTCStats', { id: this.id });
    if (Platform.OS === 'ios') {
      HmsManager.enableRTCStats({ id: this.id });
    } else {
      console.log('API currently not avaialble for android');
    }
  };

  /**
   * - disable RTCStats sets the same boolean to false that was set true by enableRTCStats.
   * that activates a check which filters out the events acquired in native listeners and don't
   * let them pass through bridge
   *
   * - currently available for iOS only.
   * @memberof HMSSDK
   */
  disableRTCStats = () => {
    logger?.verbose('#Function disableRTCStats', { id: this.id });
    if (Platform.OS === 'ios') {
      HmsManager.disableRTCStats({ id: this.id });
    } else {
      console.log('API currently not avaialble for android');
    }
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   *
   * @param {string} action
   * @param {*} callback
   * @memberof HMSSDK
   */
  addEventListener = (action: HMSUpdateListenerActions, callback: any) => {
    logger?.verbose('#Function addEventListener', {
      action,
      id: this.id,
    });
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW:
        this.onPreviewDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_JOIN:
        this.onJoinDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ROOM_UPDATE:
        this.onRoomDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_PEER_UPDATE:
        this.onPeerDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_TRACK_UPDATE:
        this.onTrackDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ERROR:
        this.onErrorDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_MESSAGE:
        this.onMessageDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_SPEAKER:
        this.onSpeakerDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTING:
        this.onReconnectingDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTED:
        this.onReconnectedDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST:
        this.onRoleChangeRequestDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST:
        this.onChangeTrackStateRequestDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM:
        this.onRemovedFromRoomDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_RTC_STATS:
        this.onRtcStatsDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS:
        this.onLocalAudioStatsDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS:
        this.onLocalVideoStatsDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS:
        this.onRemoteAudioStatsDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS:
        this.onRemoteVideoStatsDelegate = callback;
        break;
      default:
    }
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   *
   * @param {string} action
   * @param {*} callback
   * @memberof HMSSDK
   */
  removeEventListener = (action: HMSUpdateListenerActions) => {
    logger?.verbose('#Function removeEventListener', { action, id: this.id });
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW:
        this.onPreviewDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_JOIN:
        this.onJoinDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_ROOM_UPDATE:
        this.onRoomDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_PEER_UPDATE:
        this.onPeerDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_TRACK_UPDATE:
        this.onTrackDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_ERROR:
        this.onErrorDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_MESSAGE:
        this.onMessageDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_SPEAKER:
        this.onSpeakerDelegate = null;
        break;
      case HMSUpdateListenerActions.RECONNECTING:
        this.onReconnectingDelegate = null;
        break;
      case HMSUpdateListenerActions.RECONNECTED:
        this.onReconnectedDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST:
        this.onRoleChangeRequestDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST:
        this.onChangeTrackStateRequestDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM:
        this.onRemovedFromRoomDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_RTC_STATS:
        this.onRtcStatsDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS:
        this.onLocalAudioStatsDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS:
        this.onLocalVideoStatsDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS:
        this.onRemoteAudioStatsDelegate = null;
        break;
      case HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS:
        this.onRemoteVideoStatsDelegate = null;
        break;
      default:
    }
  };

  /**
   * removes all the listeners
   *
   * @memberof HMSSDK
   */
  removeAllListeners = () => {
    this.onPreviewDelegate = null;
    this.onJoinDelegate = null;
    this.onRoomDelegate = null;
    this.onPeerDelegate = null;
    this.onTrackDelegate = null;
    this.onErrorDelegate = null;
    this.onMessageDelegate = null;
    this.onSpeakerDelegate = null;
    this.onReconnectingDelegate = null;
    this.onReconnectedDelegate = null;
    this.onRoleChangeRequestDelegate = null;
    this.onChangeTrackStateRequestDelegate = null;
    this.onRemovedFromRoomDelegate = null;

    logger?.verbose('#Function REMOVE_ALL_LISTENER', { id: this.id });
  };

  /**
   * - Below are all the listeners that are connected to native side.
   *
   * - All of the are connected when build function is called, we can connect them to the app by
   * calling {@link addEventListener} with corresponding event type.
   *
   * - Before passing the data to the eventListener of the app these listeners encode the data in
   * ts classes for a proper structuring of the data.
   *
   * - Even When event listeners of the app are disconnected using {@link removeEventListener} or
   * {@link removeAllListeners} or not even connected in first place, these functions still run to
   * maintain the current state of the instance of {@link HMSSDK}.
   *
   */

  onPreviewListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_PREVIEW', data);
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer,
      this.id
    );

    const previewTracks = HMSEncoder.encodeHmsPreviewTracks(data.previewTracks);

    this.localPeer = localPeer;
    this.room = room;
    if (this.onPreviewDelegate) {
      logger?.verbose('#Listener ON_PREVIEW_LISTENER_CALL', {
        ...data,
        room,
        localPeer,
        previewTracks,
      });
      this.onPreviewDelegate({ ...data, room, localPeer, previewTracks });
    }
  };

  onJoinListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#LISTENER ON_JOIN', data);
    // Preprocessing
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer,
      this.id
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers,
      this.id
    );
    const roles: HMSRole[] = HMSEncoder.encodeHmsRoles(data.roles);
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    this.knownRoles = roles;
    if (this.onJoinDelegate) {
      logger?.verbose('#Listener ON_JOIN_LISTENER_CALL', {
        ...data,
        room,
        localPeer,
        remotePeers,
      });
      this.onJoinDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onRoomListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_ROOM', data);
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer,
      this.id
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers,
      this.id
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onRoomDelegate) {
      logger?.verbose('#Listener ON_ROOM_LISTENER_CALL', {
        ...data,
        room,
        localPeer,
        remotePeers,
      });
      this.onRoomDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onPeerListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_PEER', data);
    const peer: HMSPeer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer,
      this.id
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers,
      this.id
    );
    // this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    this.room = room;
    if (this.onPeerDelegate) {
      logger?.verbose('#Listener ON_PEER_LISTENER_CALL', data);
      this.onPeerDelegate({ ...data, localPeer, remotePeers, room, peer });
    }
  };

  onTrackListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_TRACK', data);
    const track: HMSTrack = HMSEncoder.encodeHmsTrack(data.track, this.id);
    const peer: HMSPeer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer,
      this.id
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers,
      this.id
    );
    if (this.muteStatus && data?.type === 'TRACK_ADDED') {
      this.setPlaybackForAllAudio(this.muteStatus);
    }
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onTrackDelegate) {
      logger?.verbose('#Listener ON_TRACK_LISTENER_CALL', data);
      this.onTrackDelegate({
        ...data,
        localPeer,
        remotePeers,
        room,
        peer,
        track,
      });
    }
  };

  onMessageListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_MESSAGE', data);
    const message = new HMSMessage(data);
    if (this.onMessageDelegate) {
      logger?.verbose('#Listener ON_MESSAGE_LISTENER_CALL', message);
      this.onMessageDelegate(message);
    }
  };

  onSpeakerListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_SPEAKER', data);
    if (this.onSpeakerDelegate) {
      logger?.verbose('#Listener ON_SPEAKER_LISTENER_CALL', data);
      this.onSpeakerDelegate(HMSEncoder.encodeHmsSpeakerUpdate(data, this.id));
    }
  };

  onErrorListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.warn('#Listener ON_ERROR', data);
    logger?.verbose('#Listener ON_ERROR', data);
    if (this.onErrorDelegate) {
      logger?.verbose('#Listener ON_ERROR_LISTENER_CALL', data);
      logger?.warn('#Listener ON_ERROR_LISTENER_CALL', data);
      this.onErrorDelegate(data);
    }
  };

  onRoleChangeRequestListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_ROLE_CHANGE_REQUEST', data);
    if (this.onRoleChangeRequestDelegate) {
      const encodedRoleChangeRequest = HMSEncoder.encodeHmsRoleChangeRequest(
        data,
        this.id
      );
      logger?.verbose(
        '#Listener ON_ROLE_CHANGE_LISTENER_CALL',
        encodedRoleChangeRequest
      );
      this.onRoleChangeRequestDelegate(encodedRoleChangeRequest);
    }
  };

  onChangeTrackStateRequestListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_CHANGE_TRACK_STATE_REQUEST', data);
    if (this.onChangeTrackStateRequestDelegate) {
      const encodedRoleChangeRequest =
        HMSEncoder.encodeHmsChangeTrackStateRequest(data, this.id);
      logger?.verbose(
        '#Listener ON_CHANGE_TRACK_STATE_REQUEST_LISTENER_CALL',
        encodedRoleChangeRequest
      );
      this.onChangeTrackStateRequestDelegate(encodedRoleChangeRequest);
    }
  };

  onRemovedFromRoomListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_REMOVED_FROM_ROOM', data);
    if (this.onRemovedFromRoomDelegate) {
      let requestedBy = null;
      if (data.requestedBy) {
        requestedBy = HMSEncoder.encodeHmsPeer(data.requestedBy, this.id);
      }
      const reason = data.reason;
      const roomEnded = data.roomEnded;

      logger?.verbose('#Listener ON_REMOVED_FROM_ROOM_LISTENER_CALL', {
        requestedBy,
        reason,
        roomEnded,
        id: this.id,
      });
      this.onRemovedFromRoomDelegate({ requestedBy, reason, roomEnded });
    }
  };

  reconnectingListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_RECONNECTING', data);
    if (this.onReconnectingDelegate) {
      this.onReconnectingDelegate(data);
    }
  };

  reconnectedListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    logger?.verbose('#Listener ON_RECONNECTED', data);
    if (this.onReconnectedDelegate) {
      this.onReconnectedDelegate(data);
    }
  };

  RTCStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    logger?.verbose('#Listener RTCStatsListener', data);

    let rtcStats = HMSEncoder.encodeRTCStats(data);

    if (this.onRtcStatsDelegate) {
      this.onRtcStatsDelegate({ rtcStats });
    }
  };

  onLocalAudioStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    logger?.verbose('#Listener onLocalAudioStatsListener', data);

    let localAudioStats = new HMSLocalAudioStats(data.localAudioStats);
    let peer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    let track = HMSEncoder.encodeHmsLocalAudioTrack(data.track, this.id);

    if (this.onLocalAudioStatsDelegate) {
      this.onLocalAudioStatsDelegate({ ...data, localAudioStats, peer, track });
    }
  };

  onLocalVideoStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    logger?.verbose('#Listener onLocalVideoStatsListener', data);

    let localVideoStats = new HMSLocalVideoStats(data.localVideoStats);
    let peer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    let track = HMSEncoder.encodeHmsLocalVideoTrack(data.track, this.id);

    if (this.onLocalVideoStatsDelegate) {
      this.onLocalVideoStatsDelegate({ ...data, localVideoStats, peer, track });
    }
  };

  onRemoteAudioStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    logger?.verbose('#Listener onRemoteAudioStatsListener', data);

    let remoteAudioStats = new HMSRemoteAudioStats(data.remoteAudioStats);
    let peer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    let track = HMSEncoder.encodeHmsRemoteAudioTrack(data.track, this.id);

    if (this.onRemoteAudioStatsDelegate) {
      this.onRemoteAudioStatsDelegate({
        ...data,
        remoteAudioStats,
        peer,
        track,
      });
    }
  };

  onRemoteVideoStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    logger?.verbose('#Listener onRemoteVideoStatsListener', data);

    let remoteVideoStats = new HMSRemoteVideoStats(data.remoteVideoStats);
    let peer = HMSEncoder.encodeHmsPeer(data.peer, this.id);
    let track = HMSEncoder.encodeHmsRemoteVideoTrack(data.track, this.id);

    if (this.onRemoteVideoStatsDelegate) {
      this.onRemoteVideoStatsDelegate({
        ...data,
        remoteVideoStats,
        peer,
        track,
      });
    }
  };
}
