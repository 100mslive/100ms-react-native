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
import { HMSVideoViewMode } from './HMSVideoViewMode';
import type { HMSTrackSettings } from './HMSTrackSettings';
import type { HMSRTMPConfig } from './HMSRTMPConfig';
import type { HMSHLSConfig } from './HMSHLSConfig';

interface HmsComponentProps {
  trackId: string;
  sink: boolean;
  style: ViewStyle;
  mirror?: boolean;
  scaleType: HMSVideoViewMode;
  id?: string | null;
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

  constructor(id: string) {
    this.id = id;
  }

  /**
   * - Returns an instance of [HMSSDK]{@link HMSSDK}
   * - This function must be called to get an instance of HMSSDK class and only then user can interact with its methods
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

  static getLogger() {
    return logger;
  }

  setLogger = (hmsLogger: HMSLogger) => {
    logger = hmsLogger;
    hmsLogger.verbose('#Function setLogger', { id: this.id });
  };

  destroy = () => {
    this.removeListeners();
  };

  attachPreviewListener = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      this.onPreviewListener
    );
  };

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
  };

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
  };

  /**
   * takes an instance of [HMSConfig]{@link HMSConfig} and joins the room
   * after joining the room user will start receiving the events and updates of the room
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  join = async (config: HMSConfig) => {
    logger?.verbose('#Function join', { config, id: this.id });
    this.addAppStateListener();
    await HmsManager.join({ ...config, id: this.id });
  };

  preview = (config: HMSConfig) => {
    logger?.verbose('#Function preview', { config, id: this.id });
    HmsManager.preview({ ...config, id: this.id });
  };

  HmsView = ({
    sink,
    trackId,
    style,
    mirror,
    scaleType = HMSVideoViewMode.ASPECT_FIT,
  }: HmsComponentProps) => {
    return (
      <HMSViewComponent
        sink={sink}
        trackId={trackId}
        style={style}
        mirror={mirror}
        scaleType={scaleType}
        id={this.id}
      />
    );
  };

  /**
   * Calls leave function of native sdk and session of current user is invalidated
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

  changeMetadata = (metadata: string) => {
    logger?.verbose('#Function changeMetadata', { metadata, id: this.id });
    HmsManager.changeMetadata({ metadata, id: this.id });
  };

  startRTMPOrRecording = async (data: HMSRTMPConfig) => {
    logger?.verbose('#Function startRTMPOrRecording', {
      ...data,
      id: this.id,
    });

    const op = await HmsManager.startRTMPOrRecording({ ...data, id: this.id });
    return op;
  };

  stopRtmpAndRecording = async () => {
    logger?.verbose('#Function stopRtmpAndRecording', {});
    const op = await HmsManager.stopRtmpAndRecording({ id: this.id });
    return op;
  };

  startHLSStreaming = async (data: HMSHLSConfig) => {
    logger?.verbose('#Function startHLSStreaming', {
      ...data,
      id: this.id,
    });
    return await HmsManager.startHLSStreaming({ ...data, id: this.id });
  };

  stopHLSStreaming = async () => {
    logger?.verbose('#Function stopHLSStreaming', {});
    return await HmsManager.stopHLSStreaming({ id: this.id });
  };

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

  endRoom = async (reason: string, lock: boolean = false) => {
    logger?.verbose('#Function endRoom', { lock, reason, id: this.id });
    const data = {
      lock,
      reason,
      id: this.id,
    };

    return await HmsManager.endRoom(data);
  };

  acceptRoleChange = async () => {
    logger?.verbose('#Function acceptRoleChange', { id: this.id });
    return await HmsManager.acceptRoleChange({ id: this.id });
  };

  muteAllPeersAudio = (mute: boolean) => {
    logger?.verbose('#Function muteAllPeersAudio', { mute, id: this.id });
    this.muteStatus = mute;
    HmsManager.muteAllPeersAudio({ mute, id: this.id });
  };

  getRoom = async () => {
    logger?.verbose('#Function getRoom', {
      roomID: this.room?.id,
      id: this.id,
    });
    const hmsRoom = await HmsManager.getRoom({ id: this.id });

    const encodedHmsRoom = HMSEncoder.encodeHmsRoom(hmsRoom, this.id);
    return encodedHmsRoom;
  };

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

  startScreenshare = async () => {
    logger?.verbose('#Function startScreenshare', { id: this.id });
    await HmsManager.startScreenshare({ id: this.id });
  };

  stopScreenshare = async () => {
    logger?.verbose('#Function startScreenshare', { id: this.id });
    await HmsManager.stopScreenshare({ id: this.id });
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   * - This method will be @deprecated in future and event listener will be passed in join method
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
      default:
    }
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   * - This method will be @deprecated in future and event listener will be passed in join method
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
      this.muteAllPeersAudio(this.muteStatus);
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
      this.onSpeakerDelegate(data);
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
}
