import React from 'react';
import { AppState, Platform } from 'react-native';
import { HMSEncoder } from './HMSEncoder';
import { HMSHelper } from './HMSHelper';
import { getLogger, logger, setLogger } from './HMSLogger';
import { HMSTrackType } from './HMSTrackType';
import { HMSUpdateListenerActions } from './HMSUpdateListenerActions';
import { HmsViewComponent } from './HmsView';
import type { HmsComponentProps } from './HmsView';

import HMSManager from './HMSManagerModule';

import type { HMSConfig } from './HMSConfig';
import type { HMSLocalPeer } from './HMSLocalPeer';
import type { HMSRemotePeer } from './HMSRemotePeer';
import type { HMSRoom } from './HMSRoom';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSLogger } from './HMSLogger';
import type { HMSPeer } from './HMSPeer';
import type { HMSVideoViewMode } from './HMSVideoViewMode';
import type { HMSTrackSettings } from './HMSTrackSettings';
import type { HMSRTMPConfig } from './HMSRTMPConfig';
import type { HMSHLSConfig } from './HMSHLSConfig';
import type { HMSAudioDevice } from './HMSAudioDevice';
import type { HMSAudioMode } from './HMSAudioMode';
import type { HMSAudioMixingMode } from './HMSAudioMixingMode';
import type { HMSLogSettings } from './HMSLogSettings';
import { HMSPIPListenerActions } from './HMSPIPListenerActions';
import HMSNativeEventListener from './HMSNativeEventListener';
import type { HMSNativeEventSubscription } from './HMSNativeEventListener';
import {
  clearHmsPeersCache,
  getHmsPeersCache,
  HMSPeersCache,
  setHmsPeersCache,
} from './HMSPeersCache';
import {
  clearHmsRoomCache,
  getHmsRoomCache,
  HMSRoomCache,
  setHmsRoomCache,
} from './HMSRoomCache';
import { HMSPeerUpdateOrdinals } from './HMSPeerUpdate';
import { HMSSessionStore } from './HMSSessionStore';
import type { HMSPeerListIteratorOptions } from './HMSPeerListIteratorOptions';
import { HMSPeerListIterator } from './HMSPeerListIterator';

type HmsViewProps = Omit<HmsComponentProps, 'id'>;

// TODO: Rename to HMSPIPConfig & to be moved to a separate file
interface PIPConfig {
  aspectRatio?: [number, number];
  endButton?: boolean;
  audioButton?: boolean;
  videoButton?: boolean;
}

const ReactNativeVersion = require('react-native/Libraries/Core/ReactNativeVersion');

let HmsSdk: HMSSDK | undefined;

export class HMSSDK {
  id: string;
  private muteStatus: boolean | undefined;
  private appStateSubscription?: any;
  private onPreviewDelegate?: any;
  private onJoinDelegate?: any;
  private onRoomDelegate?: any;
  private onPeerDelegate?: any;
  private onTrackDelegate?: any;
  private onErrorDelegate?: any;
  private onMessageDelegate?: any;
  private onSpeakerDelegate?: any;
  private onReconnectingDelegate?: any;
  private onReconnectedDelegate?: any;
  private onRoleChangeRequestDelegate?: any;
  private onChangeTrackStateRequestDelegate?: any;
  private onRemovedFromRoomDelegate?: any;
  private onRtcStatsDelegate?: any;
  private onLocalAudioStatsDelegate?: any;
  private onLocalVideoStatsDelegate?: any;
  private onRemoteAudioStatsDelegate?: any;
  private onRemoteVideoStatsDelegate?: any;
  private onAudioDeviceChangedDelegate?: any;
  private onSessionStoreAvailableDelegate?: any;
  private onPIPRoomLeaveDelegate?: any;

  private emitterSubscriptions: Partial<
    Record<
      HMSUpdateListenerActions | HMSPIPListenerActions,
      HMSNativeEventSubscription
    >
  > = {};

  private constructor(id: string) {
    this.id = id;
  }

  /**
   * - Returns an instance of [HMSSDK] {@link HMSSDK}
   * - This function must be called to get an instance of HMSSDK class and only then user can interact with its methods.
   *
   * Regular Usage:
   *
   * const hmsInstance = await HMSSDK.build();
   *
   * For Advanced Use-Cases:
   * @param {trackSettings} trackSettings is an optional value only required to enable features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
   * @param {appGroup} appGroup is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
   * @param {preferredExtension} preferredExtension is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
   *
   * @static
   * @returns
   * @memberof HMSSDK
   */
  static async build(params?: {
    trackSettings?: HMSTrackSettings;
    appGroup?: String;
    preferredExtension?: String;
    logSettings?: HMSLogSettings;
    isPrebuilt?: boolean;
  }) {
    const { version } = require('../../package.json');
    const { major, minor, patch } = ReactNativeVersion.version;
    let id = await HMSManager.build({
      trackSettings: params?.trackSettings,
      appGroup: params?.appGroup, // required for iOS Screenshare, not required for Android
      preferredExtension: params?.preferredExtension, // required for iOS Screenshare, not required for Android
      frameworkInfo: {
        version: major + '.' + minor + '.' + patch,
        sdkVersion: version,
        isPrebuilt: params?.isPrebuilt || false,
      },
      logSettings: params?.logSettings,
    });
    HmsSdk = new HMSSDK(id);
    return HmsSdk;
  }

  /**
   * - Calls removeListeners that in turn breaks all connections with native listeners.
   *
   * @memberof HMSSDK
   */
  destroy = async () => {
    logger?.verbose('#Function destroy', { id: this.id });
    clearHmsPeersCache();
    clearHmsRoomCache();
    this.removeAllListeners();
    return await HMSManager.destroy({ id: this.id });
  };

  /**
   * - getAuthTokenByRoomCode function is used to get the Auth Token by Room Code
   *
   * checkout {@link https://www.100ms.live/docs/concepts/v2/concepts/rooms/room-codes/room-codes} for more info
   *
   * @memberof HMSSDK
   */
  getAuthTokenByRoomCode = async (
    roomCode: string,
    userId?: string,
    endpoint?: string
  ): Promise<string> => {
    logger?.verbose('#Function getAuthTokenByRoomCode', {
      id: this.id,
      roomCode,
      userId,
      endpoint,
    });

    return HMSManager.getAuthTokenByRoomCode({
      id: this.id,
      roomCode,
      userId,
      endpoint,
    });
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
    setHmsPeersCache(new HMSPeersCache(this.id));
    setHmsRoomCache(new HMSRoomCache(this.id));
    await HMSManager.join({ ...config, id: this.id });
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
    HMSManager.preview({ ...config, id: this.id });
  };

  /**
   * - HmsView is react component that takes trackId and starts showing that track on a tile.
   * - The appearance of tile is completely customizable with style prop.
   * - Scale type can determine how the incoming video will fit in the canvas check {@link HMSVideoViewMode} for more information.
   * - Mirror to flip the video vertically.
   * - Auto Simulcast to automatically select the best Streaming Quality of track if feature is enabled in Room.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/render-video} for more info
   *
   * @param {HmsViewProps}
   * @memberof HMSSDK
   */
  HmsView = React.forwardRef<any, HmsViewProps>((props, ref) => {
    const {
      trackId,
      style,
      mirror,
      scaleType,
      setZOrderMediaOverlay,
      autoSimulcast,
    } = props;
    return (
      <HmsViewComponent
        ref={ref}
        trackId={trackId}
        style={style}
        autoSimulcast={autoSimulcast}
        setZOrderMediaOverlay={setZOrderMediaOverlay}
        mirror={mirror}
        scaleType={scaleType}
        id={this.id}
      />
    );
  });

  roomLeaveCleanup = () => {
    this.muteStatus = undefined;
    this?.appStateSubscription?.remove();
    clearHmsPeersCache();
    clearHmsRoomCache();
    HMSEncoder.clearData(); // Clearing cached data in encoder
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

    const op = await HMSManager.leave(data);
    this.roomLeaveCleanup();
    return op;
  };

  /**
   * - This function sends message to all the peers in the room, the get the message in onMessage listener.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/chat} for more info
   *
   * @memberof HMSSDK
   * @param message the message that is to be sent
   * @param type the default type is set to CHAT. You can pass a custom type here for sending events like Emoji Reactions, Notifications, etc
   */
  sendBroadcastMessage = async (message: string, type: string = 'chat') => {
    logger?.verbose('#Function sendBroadcastMessage', {
      message,
      type: type || null,
      id: this.id,
    });
    const data: { messageId: string | undefined } =
      await HMSManager.sendBroadcastMessage({
        message,
        type: type || null,
        id: this.id,
      });

    return data;
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
    const data: { messageId: string | undefined } =
      await HMSManager.sendGroupMessage({
        message,
        roles: HMSHelper.getRoleNames(roles),
        id: this.id,
        type: type || null,
      });

    return data;
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
    const data: { messageId: string | undefined } =
      await HMSManager.sendDirectMessage({
        message,
        peerId: peer.peerID,
        id: this.id,
        type: type || null,
      });

    return data;
  };

  /**
   * - changeMetadata changes a specific field in localPeer which is [metadata] it is a string that can
   * be used for various functionalities like raiseHand, beRightBack and many more that explains the
   * current status of the peer.
   *
   * - it is advised to use a json object in string format to store multiple dataPoints in metadata.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/advanced-features/change-metadata} for more info
   *
   * @param {string}
   * @memberof HMSSDK
   */
  changeMetadata = async (metadata: string) => {
    logger?.verbose('#Function changeMetadata', { metadata, id: this.id });
    return await HMSManager.changeMetadata({ metadata, id: this.id });
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

    const op = await HMSManager.startRTMPOrRecording({ ...data, id: this.id });
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
    const op = await HMSManager.stopRtmpAndRecording({ id: this.id });
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
  startHLSStreaming = async (data?: HMSHLSConfig) => {
    logger?.verbose('#Function startHLSStreaming', {
      ...data,
      id: this.id,
    });
    return await HMSManager.startHLSStreaming({ ...data, id: this.id });
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
    return await HMSManager.stopHLSStreaming({ id: this.id });
  };

  /**
   * @deprecated This function has been deprecated in favor of #Function changeRoleOfPeer
   *
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
    return await HMSManager.changeRole(data);
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
  changeRoleOfPeer = async (
    peer: HMSPeer,
    role: HMSRole,
    force: boolean = false
  ) => {
    const data = {
      peerId: peer.peerID,
      role: role.name,
      force: force,
      id: this.id,
    };
    logger?.verbose('#Function changeRoleOfPeer', data);
    return HMSManager.changeRoleOfPeer(data);
  };

  /**
   * - This function can be used in a situation when we want to change role of multiple peers by specifying their roles.
   * Hence manipulate their access and rights in the current room.
   * It takes the list of roles {@link HMSRole} whom role we want to change
   * and role {@link HMSRole} which will be the new role for peers.
   *
   * - Note that role will be updated without asking the peers.
   * Meaning, Peers will not get the roleChangeRequest in roleChangeRequest listener.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/change-role} for more info
   *
   * @memberof HMSSDK
   */
  changeRoleOfPeersWithRoles = async (ofRoles: HMSRole[], toRole: HMSRole) => {
    const data = {
      ofRoles: ofRoles.map((ofRole) => ofRole.name).filter(Boolean),
      toRole: toRole.name,
      id: this.id,
    };
    logger?.verbose('#Function changeRoleOfPeersWithRoles', data);
    return HMSManager.changeRoleOfPeersWithRoles(data);
  };

  /**
   * - This function can be used to manipulate mute status of any track.
   * - Targeted peer affected by this action will get a callback in onChangeTrackStateRequestListener.
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

    return await HMSManager.changeTrackState(data);
  };

  /**
   * - changeTrackStateForRoles is an enhancement on the functionality of {@link changeTrackState}.
   * - We can change mute status for all the tracks of peers having a particular role.
   * - @param source determines the source of the track ex. video, audio etc.
   * - The peers affected by this action will get a callback in onChangeTrackStateRequestListener.
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

    return await HMSManager.changeTrackStateForRoles(data);
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

    return await HMSManager.removePeer(data);
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

    return await HMSManager.endRoom(data);
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

    return await HMSManager.changeName(data);
  };

  /**
   * -Preview for a specific Role before changing it.
   *
   * By previewing before doing a Role Change, users can see their expected Audio & Video tracks which will be visible to other Peers in Room post changing the Role.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role} for more info
   *
   * @param {role: string}
   * @memberof HMSSDK
   */
  previewForRole = async (role: string) => {
    logger?.verbose('#Function previewForRole', {
      role,
      id: this.id,
    });
    const data = await HMSManager.previewForRole({
      role,
      id: this.id,
    });

    const previewTracks = HMSEncoder.encodeHmsPreviewForRoleTracks(
      data.tracks,
      this.id
    );

    return previewTracks;
  };

  /**
   * Cancel the Previewing for Role invocation.
   *
   * If a [previewForRole] call was performed previously then calling this method clears the tracks created anticipating a Change of Role
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role} for more info
   *
   * @memberof HMSSDK
   */
  cancelPreview = async () => {
    logger?.verbose('#Function cancelPreview', {
      id: this.id,
    });
    const data: { data: string } = await HMSManager.cancelPreview({
      id: this.id,
    });

    return data;
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
    return await HMSManager.acceptRoleChange({ id: this.id });
  };

  /**
   * - setPlaybackForAllAudio is an extension of the abilities of setPlaybackAllowed in
   * HMSRemoteAudioTrack. It sets mute status for all peers in the room only for the local peer.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/playback-allowed} for more info
   *
   * @memberof HMSSDK
   */
  setPlaybackForAllAudio = (mute: boolean) => {
    logger?.verbose('#Function setPlaybackForAllAudio', { mute, id: this.id });
    this.muteStatus = mute;
    HMSManager.setPlaybackForAllAudio({ mute, id: this.id });
  };

  /**
   * - This function mutes audio for all peers in the room.
   *
   * @memberof HMSSDK
   */
  remoteMuteAllAudio = async () => {
    logger?.verbose('#Function remoteMuteAllAudio', { id: this.id });
    return await HMSManager.remoteMuteAllAudio({ id: this.id });
  };

  /**
   * - getRoom is a wrapper function on an existing native function also known as getRoom the returns
   * current room object which is of type {@link HMSRoom}
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/join#get-room} for more info
   *
   * @memberof HMSSDK
   * @return Promise<HMSRoom>
   */
  getRoom = async (): Promise<HMSRoom> => {
    logger?.verbose('#Function getRoom', {
      id: this.id,
    });
    const hmsRoom = await HMSManager.getRoom({ id: this.id });

    getHmsRoomCache()?.updateRoomCache(hmsRoom);

    const encodedHmsRoom = HMSEncoder.encodeHmsRoom(hmsRoom, this.id);
    return encodedHmsRoom;
  };

  /**
   * - getLocalPeer is a wrapper function on an existing native function also known as getLocalPeer the returns
   * current local peer object which is of type {@link HMSLocalPeer}
   *
   * @memberof HMSSDK
   * @return Promise<HMSLocalPeer>
   */
  getLocalPeer = async (): Promise<HMSLocalPeer> => {
    logger?.verbose('#Function getLocalPeer', {
      id: this.id,
    });
    const localPeer = await HMSManager.getLocalPeer({ id: this.id });

    const encodedLocalPeer = HMSEncoder.encodeHmsLocalPeer(localPeer, this.id);
    return encodedLocalPeer;
  };

  /**
   * - getRemotePeers is a wrapper function on an existing native function also known as getRemotePeers the returns
   * remote peers array which is of type {@link HMSRemotePeer}
   *
   * @memberof HMSSDK
   * @return Promise<HMSRemotePeer[]>
   */
  getRemotePeers = async (): Promise<HMSRemotePeer[]> => {
    logger?.verbose('#Function getRemotePeers', {
      id: this.id,
    });
    const remotePeers = await HMSManager.getRemotePeers({ id: this.id });

    const encodedRemotePeers = HMSEncoder.encodeHmsRemotePeers(
      remotePeers,
      this.id
    );
    return encodedRemotePeers;
  };

  /**
   * - getRoles is a wrapper function on an existing native function also known as getRoles the returns
   * array of all present roles which is of type {@link HMSRole}
   *
   * @memberof HMSSDK
   * @return Promise<HMSRole[]>
   */
  getRoles = async (): Promise<HMSRole[]> => {
    logger?.verbose('#Function getRoles', {
      id: this.id,
    });
    const roles = await HMSManager.getRoles({ id: this.id });

    const encodedRoles = HMSEncoder.encodeHmsRoles(roles);
    return encodedRoles;
  };

  /**
   * - This function sets the volume of any peer in the room
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/advanced-features/set-volume} for more info
   *
   * @memberof HMSSDK
   */
  setVolume = (track: HMSTrack, volume: number) => {
    logger?.verbose('#Function setVolume', {
      track,
      volume,
      id: this.id,
    });
    HMSManager.setVolume({
      id: this.id,
      trackId: track.trackId,
      volume,
    });
  };

  resetVolume = () => {
    logger?.verbose('#Function resetVolume', { id: this.id });
    if (Platform.OS === 'android') HMSManager.resetVolume({ id: this.id });
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
    return await HMSManager.startScreenshare({ id: this.id });
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
    return await HMSManager.isScreenShared({ id: this.id });
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
    return await HMSManager.stopScreenshare({ id: this.id });
  };

  enableNetworkQualityUpdates = () => {
    logger?.verbose('#Function enableNetworkQualityUpdates', { id: this.id });
    HMSManager.enableNetworkQualityUpdates({ id: this.id });
  };

  disableNetworkQualityUpdates = () => {
    logger?.verbose('#Function disableNetworkQualityUpdates', { id: this.id });
    HMSManager.disableNetworkQualityUpdates({ id: this.id });
  };

  /**
   * - This wrapper function is used to start streaming device audio, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-share#how-to-stream-device-audio-from-the-app} for more info.
   *
   * @param {HMSAudioMixingMode}
   * @memberof HMSSDK
   */
  startAudioshare = async (audioMixingMode: HMSAudioMixingMode) => {
    logger?.verbose('#Function startAudioshare', {
      id: this.id,
      audioMixingMode,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.startAudioshare({ id: this.id, audioMixingMode });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function returns true if audio is being shared and vice versa, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-share#how-to-get-audio-share-status} for more info.
   *
   * @memberof HMSSDK
   */
  isAudioShared = async () => {
    logger?.verbose('#Function isAudioShared', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.isAudioShared({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function is used to stop streaming device audio, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-share#how-to-stop-audio-sharing} for more info.
   *
   * @memberof HMSSDK
   */
  stopAudioshare = async () => {
    logger?.verbose('#Function stopAudioshare', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.stopAudioshare({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function returns the current audio mixing mode, currently available only for android.
   *
   * @memberof HMSSDK
   * @return HMSAudioMixingMode
   */
  getAudioMixingMode = async () => {
    logger?.verbose('#Function getAudioMixingMode', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioMixingMode({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function used to change the mode while the user is streaming audio, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-share#how-to-change-mode} for more info
   *
   * @param {HMSAudioMixingMode}
   * @memberof HMSSDK
   */
  setAudioMixingMode = async (audioMixingMode: HMSAudioMixingMode) => {
    logger?.verbose('#Function setAudioMixingMode', {
      id: this.id,
      audioMixingMode,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.setAudioMixingMode({
        id: this.id,
        audioMixingMode,
      });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function returns the array of audio output devices which is of
   * type {@link HMSAudioDevice[]}, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-output-routing#get-list-of-audio-device} for more info
   *
   * @memberof HMSSDK
   * @return HMSAudioDevice[]
   */
  getAudioDevicesList = async () => {
    logger?.verbose('#Function getAudioDevicesList', {
      id: this.id,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioDevicesList({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This wrapper function returns the current audio output device which is of
   * type {@link HMSAudioDevice}, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-output-routing#get-current-focussed-device} for more info
   *
   * @memberof HMSSDK
   * @return HMSAudioDevice
   */
  getAudioOutputRouteType = async () => {
    logger?.verbose('#Function getAudioOutputRouteType', {
      id: this.id,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioOutputRouteType({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * Android Only
   * - This wrapper function used to switch output to device other than the default, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-output-routing#switch-audio-focus-to-another-device} for more info
   *
   * @memberof HMSSDK
   * @param audioDevice
   */
  switchAudioOutput = (audioDevice: HMSAudioDevice) => {
    logger?.verbose('#Function switchAudioOutput', {
      id: this.id,
      audioDevice,
    });
    if (Platform.OS === 'android') {
      return HMSManager.switchAudioOutput({ id: this.id, audioDevice });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  switchAudioOutputUsingIOSUI = () => {
    logger?.verbose('#Function switchAudioOutputUsingIOSUI', {
      id: this.id,
    });
    if (Platform.OS !== 'ios') {
      throw new Error(
        '#Function `switchAudioOutputUsingIOSUI` is only available on iOS, use `switchAudioOutput` method instead!'
      );
    }

    return HMSManager.switchAudioOutputUsingIOSUI({ id: this.id });
  };

  /**
   * - This wrapper function used to change Audio Mode manually, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-mode-change} for more info
   *
   * @param {HMSAudioMode}
   * @memberof HMSSDK
   */
  setAudioMode = (audioMode: HMSAudioMode) => {
    logger?.verbose('#Function setAudioMode', {
      id: this.id,
      audioMode,
    });
    if (Platform.OS === 'android') {
      return HMSManager.setAudioMode({ id: this.id, audioMode });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  /**
   * - This is a wrapper function which adds a listener which is triggered when audio output device is switched, currently available only for android.
   *
   * checkout {@link https://www.100ms.live/docs/react-native/v2/features/audio-output-routing#adding-a-listener} for more info
   *
   * @param {Function}
   * @memberof HMSSDK
   */
  setAudioDeviceChangeListener = (callback: Function) => {
    logger?.verbose('#Function setAudioDeviceChangeListener', {
      id: this.id,
    });
    if (Platform.OS === 'android') {
      this.addEventListener(
        HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED,
        callback
      );
      return HMSManager.setAudioDeviceChangeListener({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return 'API currently not available for iOS';
    }
  };

  getRemoteVideoTrackFromTrackId = async (trackId: string) => {
    logger?.verbose('#Function getRemoteVideoTrackFromTrackId', {
      id: this.id,
      trackId,
    });

    const remoteVideoTrackData =
      await HMSManager.getRemoteVideoTrackFromTrackId({
        id: this.id,
        trackId,
      });
    return HMSEncoder.encodeHmsRemoteVideoTrack(remoteVideoTrackData, this.id);
  };

  getRemoteAudioTrackFromTrackId = async (trackId: string) => {
    logger?.verbose('#Function getRemoteAudioTrackFromTrackId', {
      id: this.id,
      trackId,
    });

    const remoteAudioTrackData =
      await HMSManager.getRemoteAudioTrackFromTrackId({
        id: this.id,
        trackId,
      });
    return HMSEncoder.encodeHmsRemoteAudioTrack(remoteAudioTrackData, this.id);
  };

  getPeerFromPeerId = (peerId: string) => {
    logger?.verbose('#Function getPeerFromPeerId', {
      id: this.id,
      peerId,
    });
    // Getting Peer Cache
    const peersCache = getHmsPeersCache();

    // If Peer Cache doesn't exist, return `undefined` as we don't have Peer
    if (!peersCache) return;

    const peerRole = peersCache.getProperty(peerId, 'role');

    // If Peer doesn't have valid Role, return `undefined` as we don't have Peer
    if (!peerRole) return;

    return HMSEncoder.encodeHmsPeer({ peerID: peerId });
  };

  /**
   * - This function is used to raise hand for the local peer
   * @memberof HMSSDK
   */
  raiseLocalPeerHand = async () => {
    const data = {
      id: this.id,
    };
    logger?.verbose('#Function raiseLocalPeerHand', data);
    return HMSManager.raiseLocalPeerHand(data);
  };

  /**
   * - This function is used to lower hand for the local peer
   * @memberof HMSSDK
   */
  lowerLocalPeerHand = async () => {
    const data = {
      id: this.id,
    };
    logger?.verbose('#Function lowerLocalPeerHand', data);
    return HMSManager.raiseLocalPeerHand(data);
  };

  /**
   * - This function is used to lower hand for the remote peer
   * @param peer
   */
  lowerRemotePeerHand = async (peer: HMSPeer) => {
    const data = {
      peerId: peer.peerID,
      id: this.id,
    };
    logger?.verbose('#Function lowerRemotePeerHand', data);
    return HMSManager.lowerRemotePeerHand(data);
  };


  getPeerListIterator = (options?: HMSPeerListIteratorOptions): HMSPeerListIterator => {
    logger?.verbose('#Function getPeerListIterator', {
      id: this.id,
      options,
    });

    const uniqueId = Date.now();

    const data: null | { sucess: boolean, uniqueId: number } = HMSManager.getPeerListIterator({
      id: this.id,
      ...options,
      limit: options?.limit ?? 10,
      uniqueId: uniqueId,
    });

    if (!data) {
      throw new Error('Unable to create PeerListIterator');
    }

    return new HMSPeerListIterator(data.uniqueId);
  }

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   *
   * @param {string} action
   * @param {*} callback
   * @memberof HMSSDK
   */
  addEventListener = (
    action: HMSUpdateListenerActions | HMSPIPListenerActions,
    callback: any
  ) => {
    logger?.verbose('#Function addEventListener', {
      action,
      id: this.id,
    });
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW: {
        // Checking if we already have ON_PREVIEW subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_PREVIEW]) {
          // Adding ON_PREVIEW native listener
          const previewSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_PREVIEW,
            this.onPreviewListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PREVIEW] =
            previewSubscription;
        }
        // Adding App Delegate listener
        this.onPreviewDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_JOIN: {
        // Checking if we already have ON_JOIN subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_JOIN]) {
          // Adding ON_JOIN native listener
          const joinSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_JOIN,
            this.onJoinListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_JOIN] =
            joinSubscription;
        }
        // Adding App Delegate listener
        this.onJoinDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_ROOM_UPDATE: {
        // Checking if we already have ON_ROOM_UPDATE subscription
        if (
          !this.emitterSubscriptions[HMSUpdateListenerActions.ON_ROOM_UPDATE]
        ) {
          // Adding ON_ROOM_UPDATE native listener
          const roomSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_ROOM_UPDATE,
            this.onRoomListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ROOM_UPDATE] =
            roomSubscription;
        }
        // Adding App Delegate listener
        this.onRoomDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_PEER_UPDATE: {
        // Checking if we already have ON_PEER_UPDATE subscription
        if (
          !this.emitterSubscriptions[HMSUpdateListenerActions.ON_PEER_UPDATE]
        ) {
          // Adding ON_PEER_UPDATE native listener
          const peerSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_PEER_UPDATE,
            this.onPeerListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PEER_UPDATE] =
            peerSubscription;
        }
        // Adding App Delegate listener
        this.onPeerDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_TRACK_UPDATE: {
        // Checking if we already have ON_TRACK_UPDATE subscription
        if (
          !this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRACK_UPDATE]
        ) {
          // Adding ON_TRACK_UPDATE native listener
          const trackSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_TRACK_UPDATE,
            this.onTrackListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRACK_UPDATE] =
            trackSubscription;
        }
        // Adding App Delegate listener
        this.onTrackDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_ERROR: {
        // Checking if we already have ON_ERROR subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_ERROR]) {
          // Adding ON_ERROR native listener
          const errorSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_ERROR,
            this.onErrorListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ERROR] =
            errorSubscription;
        }
        // Adding App Delegate listener
        this.onErrorDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_MESSAGE: {
        // Checking if we already have ON_MESSAGE subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_MESSAGE]) {
          // Adding ON_MESSAGE native listener
          const messageSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_MESSAGE,
            this.onMessageListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_MESSAGE] =
            messageSubscription;
        }
        // Adding App Delegate listener
        this.onMessageDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_SPEAKER: {
        // Checking if we already have ON_SPEAKER subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_SPEAKER]) {
          // Adding ON_SPEAKER native listener
          const speakerSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_SPEAKER,
            this.onSpeakerListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_SPEAKER] =
            speakerSubscription;
        }
        // Adding App Delegate listener
        this.onSpeakerDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.RECONNECTING: {
        // Checking if we already have RECONNECTING subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTING]) {
          // Adding RECONNECTING native listener
          const reconnectingSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.RECONNECTING,
            this.reconnectingListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTING] =
            reconnectingSubscription;
        }
        // Adding App Delegate listener
        this.onReconnectingDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.RECONNECTED: {
        // Checking if we already have RECONNECTED subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTED]) {
          // Adding RECONNECTED native listener
          const reconnectedSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.RECONNECTED,
            this.reconnectedListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTED] =
            reconnectedSubscription;
        }
        // Adding App Delegate listener
        this.onReconnectedDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST: {
        // Checking if we already have ON_ROLE_CHANGE_REQUEST subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
          ]
        ) {
          // Adding ON_ROLE_CHANGE_REQUEST native listener
          const roleChangeReqSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST,
            this.onRoleChangeRequestListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
          ] = roleChangeReqSubscription;
        }
        // Adding App Delegate listener
        this.onRoleChangeRequestDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST: {
        // Checking if we already have ON_CHANGE_TRACK_STATE_REQUEST subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST
          ]
        ) {
          // Adding ON_CHANGE_TRACK_STATE_REQUEST native listener
          const changeTrackReqSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST,
            this.onChangeTrackStateRequestListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST
          ] = changeTrackReqSubscription;
        }
        // Adding App Delegate listener
        this.onChangeTrackStateRequestDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM: {
        // Checking if we already have ON_REMOVED_FROM_ROOM subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM
          ]
        ) {
          // Adding ON_REMOVED_FROM_ROOM native listener
          const removedFromRoomSubscription =
            HMSNativeEventListener.addListener(
              this.id,
              HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
              this.onRemovedFromRoomListener
            );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM
          ] = removedFromRoomSubscription;
        }
        // Adding App Delegate listener
        this.onRemovedFromRoomDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_RTC_STATS: {
        // Checking if we already have ON_RTC_STATS subscription
        if (!this.emitterSubscriptions[HMSUpdateListenerActions.ON_RTC_STATS]) {
          // Adding ON_RTC_STATS native listener
          const rtcStatsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_RTC_STATS,
            this.RTCStatsListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_RTC_STATS] =
            rtcStatsSubscription;
        }
        // Adding App Delegate listener
        this.onRtcStatsDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS: {
        // Checking if we already have ON_LOCAL_AUDIO_STATS subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS
          ]
        ) {
          // Adding ON_LOCAL_AUDIO_STATS native listener
          const lclAudioStatsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS,
            this.onLocalAudioStatsListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS
          ] = lclAudioStatsSubscription;
        }
        // Adding App Delegate listener
        this.onLocalAudioStatsDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS: {
        // Checking if we already have ON_LOCAL_VIDEO_STATS subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS
          ]
        ) {
          // Adding ON_LOCAL_VIDEO_STATS native listener
          const lclVideoStatsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS,
            this.onLocalVideoStatsListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS
          ] = lclVideoStatsSubscription;
        }
        // Adding App Delegate listener
        this.onLocalVideoStatsDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS: {
        // Checking if we already have ON_REMOTE_AUDIO_STATS subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS
          ]
        ) {
          // Adding ON_REMOTE_AUDIO_STATS native listener
          const rmAudioStatsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS,
            this.onRemoteAudioStatsListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS
          ] = rmAudioStatsSubscription;
        }
        // Adding App Delegate listener
        this.onRemoteAudioStatsDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS: {
        // Checking if we already have ON_REMOTE_VIDEO_STATS subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS
          ]
        ) {
          // Adding ON_REMOTE_VIDEO_STATS native listener
          const rmVideoStatsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS,
            this.onRemoteVideoStatsListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS
          ] = rmVideoStatsSubscription;
        }
        // Adding App Delegate listener
        this.onRemoteVideoStatsDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED: {
        // Checking if we already have ON_AUDIO_DEVICE_CHANGED subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
          ]
        ) {
          // Adding ON_AUDIO_DEVICE_CHANGED native listener
          const audDeviceChgSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED,
            this.onAudioDeviceChangedListener
          );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
          ] = audDeviceChgSubscription;
        }
        // Adding App Delegate listener
        this.onAudioDeviceChangedDelegate = callback;
        break;
      }
      case HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE: {
        // Checking if we already have ON_SESSION_STORE_AVAILABLE subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE
          ]
        ) {
          // Adding ON_SESSION_STORE_AVAILABLE native listener
          const sessionStoreAvailableSubscription =
            HMSNativeEventListener.addListener(
              this.id,
              HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE,
              this.onSessionStoreAvailableListener
            );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE
          ] = sessionStoreAvailableSubscription;
        }
        // Adding Session Store Available App Delegate listener
        this.onSessionStoreAvailableDelegate = callback;
        break;
      }
      case HMSPIPListenerActions.ON_PIP_ROOM_LEAVE: {
        if (Platform.OS === 'android') {
          // Checking if we already have ON_PIP_ROOM_LEAVE subscription
          if (
            !this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_ROOM_LEAVE]
          ) {
            // Adding ON_PIP_ROOM_LEAVE native listener
            const pipRoomLeaveSubscription = HMSNativeEventListener.addListener(
              this.id,
              HMSPIPListenerActions.ON_PIP_ROOM_LEAVE,
              this.onPIPRoomLeaveListener
            );
            this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_ROOM_LEAVE] =
              pipRoomLeaveSubscription;
          }
          // Adding App Delegate listener
          this.onPIPRoomLeaveDelegate = callback;
        }
        break;
      }
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
  removeEventListener = (
    action: HMSUpdateListenerActions | HMSPIPListenerActions
  ) => {
    logger?.verbose('#Function removeEventListener', { action, id: this.id });
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PREVIEW];
        // Removing ON_PREVIEW native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PREVIEW] =
            undefined;
        }
        // Removing App Delegate listener
        this.onPreviewDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_JOIN: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_JOIN];
        // Removing ON_JOIN native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_JOIN] =
            undefined;
        }
        // Removing App Delegate listener
        this.onJoinDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_ROOM_UPDATE: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ROOM_UPDATE];
        // Removing ON_ROOM_UPDATE native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ROOM_UPDATE] =
            undefined;
        }
        // Removing App Delegate listener
        this.onRoomDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_PEER_UPDATE: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PEER_UPDATE];
        // Removing ON_PEER_UPDATE native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_PEER_UPDATE] =
            undefined;
        }
        // Removing App Delegate listener
        this.onPeerDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_TRACK_UPDATE: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRACK_UPDATE];
        // Removing ON_TRACK_UPDATE native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRACK_UPDATE] =
            undefined;
        }
        // Removing App Delegate listener
        this.onTrackDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_ERROR: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ERROR];
        // Removing ON_ERROR native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_ERROR] =
            undefined;
        }
        // Removing App Delegate listener
        this.onErrorDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_MESSAGE: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_MESSAGE];
        // Removing ON_MESSAGE native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_MESSAGE] =
            undefined;
        }
        // Removing App Delegate listener
        this.onMessageDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_SPEAKER: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_SPEAKER];
        // Removing ON_SPEAKER native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_SPEAKER] =
            undefined;
        }
        // Removing App Delegate listener
        this.onSpeakerDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.RECONNECTING: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTING];
        // Removing RECONNECTING native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTING] =
            undefined;
        }
        // Removing App Delegate listener
        this.onReconnectingDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.RECONNECTED: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTED];
        // Removing RECONNECTED native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.RECONNECTED] =
            undefined;
        }
        // Removing App Delegate listener
        this.onReconnectedDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
          ];
        // Removing ON_ROLE_CHANGE_REQUEST native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_ROLE_CHANGE_REQUEST
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onRoleChangeRequestDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST
          ];
        // Removing ON_CHANGE_TRACK_STATE_REQUEST native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_CHANGE_TRACK_STATE_REQUEST
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onChangeTrackStateRequestDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM
          ];
        // Removing ON_REMOVED_FROM_ROOM native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onRemovedFromRoomDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_RTC_STATS: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_RTC_STATS];
        // Removing ON_RTC_STATS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_RTC_STATS] =
            undefined;
        }
        // Removing App Delegate listener
        this.onRtcStatsDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS
          ];
        // Removing ON_LOCAL_AUDIO_STATS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_AUDIO_STATS
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onLocalAudioStatsDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS
          ];
        // Removing ON_LOCAL_VIDEO_STATS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_LOCAL_VIDEO_STATS
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onLocalVideoStatsDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS
          ];
        // Removing ON_REMOTE_AUDIO_STATS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_AUDIO_STATS
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onRemoteAudioStatsDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS
          ];
        // Removing ON_REMOTE_VIDEO_STATS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_REMOTE_VIDEO_STATS
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onRemoteVideoStatsDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
          ];
        // Removing ON_AUDIO_DEVICE_CHANGED native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onAudioDeviceChangedDelegate = null;
        break;
      }
      case HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE
          ];
        // Removing ON_SESSION_STORE_AVAILABLE native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onSessionStoreAvailableDelegate = null;
        break;
      }
      case HMSPIPListenerActions.ON_PIP_ROOM_LEAVE: {
        if (Platform.OS === 'android') {
          const subscription =
            this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_ROOM_LEAVE];
          // Removing ON_PIP_ROOM_LEAVE native listener
          if (subscription) {
            subscription.remove();

            this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_ROOM_LEAVE] =
              undefined;
          }
          // Removing App Delegate listener
          this.onPIPRoomLeaveDelegate = null;
        }
        break;
      }
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
    this.onPIPRoomLeaveDelegate = null;

    // Getting list of all available `emitterSubscription` objects
    Object.values(this.emitterSubscriptions)
      .filter(Boolean)
      .forEach((emitterSubscription) => {
        emitterSubscription.remove();
      });

    // clearing reference of all `emitterSubscription` objects
    this.emitterSubscriptions = {};

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
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const previewTracks = HMSEncoder.encodeHmsPreviewTracks(
      data.previewTracks,
      this.id
    );

    if (this.onPreviewDelegate) {
      logger?.verbose('#Listener ON_PREVIEW_LISTENER_CALL', {
        room,
        previewTracks,
      });
      this.onPreviewDelegate({ room, previewTracks });
    }
  };

  onJoinListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);

    if (this.onJoinDelegate) {
      logger?.verbose('#Listener ON_JOIN_LISTENER_CALL', {
        room,
      });
      this.onJoinDelegate({ room });
    }
  };

  onRoomListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room, this.id);
    const type = data.type;

    getHmsRoomCache()?.updateRoomCache(data.room, data.type);

    if (this.onRoomDelegate) {
      logger?.verbose('#Listener ON_ROOM_LISTENER_CALL', {
        room,
        type,
      });
      this.onRoomDelegate({ room, type });
    }
  };

  onPeerListener = (peerData: any) => {
    const data: { peer: any; type: any } = {
      peer: peerData,
      type: null,
    };

    for (const ordinal of HMSPeerUpdateOrdinals.keys()) {
      if (ordinal in peerData) {
        data.peer.peerID = peerData[ordinal];
        data.type = ordinal;
        break;
      }
    }

    const peer: HMSPeer = HMSEncoder.encodeHmsPeer(data.peer);
    const type = HMSEncoder.encodeHmsPeerUpdate(data.type) || data.type;

    getHmsPeersCache()?.updatePeerCache(data.peer.peerID, data.peer, type);

    if (this.onPeerDelegate) {
      logger?.verbose('#Listener ON_PEER_LISTENER_CALL', {
        peer,
        type,
      });
      this.onPeerDelegate({ peer, type });
    }
  };

  onTrackListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    const track: HMSTrack = HMSEncoder.encodeHmsTrack(data.track, this.id);
    const peer: HMSPeer = HMSEncoder.encodeHmsPeer(data.peer);
    const type = data.type;

    getHmsPeersCache()?.updatePeerCache(data.peer.peerID, { track }, data.type);

    if (
      this.muteStatus &&
      data?.type === 'TRACK_ADDED' &&
      track.type === HMSTrackType.AUDIO
    ) {
      this.setPlaybackForAllAudio(this.muteStatus);
    }

    if (this.onTrackDelegate) {
      logger?.verbose('#Listener ON_TRACK_LISTENER_CALL', {
        peer,
        track,
        type,
      });
      this.onTrackDelegate({
        peer,
        track,
        type,
      });
    }
  };

  onMessageListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    const message = HMSEncoder.encodeHMSMessage(data);
    if (this.onMessageDelegate) {
      logger?.verbose('#Listener ON_MESSAGE_LISTENER_CALL', message);
      this.onMessageDelegate(message);
    }
  };

  onSpeakerListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onSpeakerDelegate) {
      logger?.verbose('#Listener ON_SPEAKER_LISTENER_CALL', data?.speakers);
      this.onSpeakerDelegate(
        HMSEncoder.encodeHmsSpeakers(data?.speakers, this.id)
      );
    }
  };

  onErrorListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onErrorDelegate) {
      logger?.verbose('#Listener ON_ERROR_LISTENER_CALL', data);
      logger?.warn('#Listener ON_ERROR_LISTENER_CALL', data);
      this.onErrorDelegate(HMSEncoder.encodeHMSException(data));
    }
  };

  onRoleChangeRequestListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onRoleChangeRequestDelegate) {
      const encodedRoleChangeRequest =
        HMSEncoder.encodeHmsRoleChangeRequest(data);
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
    if (this.onChangeTrackStateRequestDelegate) {
      const encodedRoleChangeRequest =
        HMSEncoder.encodeHmsChangeTrackStateRequest(data);
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
    this.roomLeaveCleanup();

    if (this.onRemovedFromRoomDelegate) {
      let requestedBy = null;
      if (data.requestedBy) {
        requestedBy = HMSEncoder.encodeHmsPeer(data.requestedBy);
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
    if (this.onReconnectingDelegate) {
      logger?.verbose('#Listener ON_RECONNECTING_CALL', data);
      this.onReconnectingDelegate(data);
    }
  };

  reconnectedListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onReconnectedDelegate) {
      logger?.verbose('#Listener ON_RECONNECTED_CALL', data);
      this.onReconnectedDelegate(data);
    }
  };

  RTCStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    let rtcStats = HMSEncoder.encodeRTCStats(data);

    if (this.onRtcStatsDelegate) {
      logger?.verbose('#Listener RTCStatsListener_CALL', { rtcStats });
      this.onRtcStatsDelegate({ rtcStats });
    }
  };

  onLocalAudioStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    let localAudioStats = HMSEncoder.encodeHMSLocalAudioStats(
      data.localAudioStats
    );
    let peer = HMSEncoder.encodeHmsPeer(data.peer);
    let track = HMSEncoder.encodeHmsLocalAudioTrack(data.track, this.id);

    if (this.onLocalAudioStatsDelegate) {
      logger?.verbose('#Listener onLocalAudioStatsListener_CALL', {
        ...data,
        localAudioStats,
        peer,
        track,
      });
      this.onLocalAudioStatsDelegate({ ...data, localAudioStats, peer, track });
    }
  };

  onLocalVideoStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    let localVideoStats = HMSEncoder.encodeHMSLocalVideoStats(
      data.localVideoStats
    );
    let peer = HMSEncoder.encodeHmsPeer(data.peer);
    let track = HMSEncoder.encodeHmsLocalVideoTrack(data.track, this.id);

    if (this.onLocalVideoStatsDelegate) {
      logger?.verbose('#Listener onLocalVideoStatsListener_CALL', {
        ...data,
        localVideoStats,
        peer,
        track,
      });
      this.onLocalVideoStatsDelegate({ ...data, localVideoStats, peer, track });
    }
  };

  onRemoteAudioStatsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }

    let remoteAudioStats = HMSEncoder.encodeHMSRemoteAudioStats(
      data.remoteAudioStats
    );
    let peer = HMSEncoder.encodeHmsPeer(data.peer);
    let track = HMSEncoder.encodeHmsRemoteAudioTrack(data.track, this.id);

    if (this.onRemoteAudioStatsDelegate) {
      logger?.verbose('#Listener onRemoteAudioStatsListener_CALL', {
        ...data,
        remoteAudioStats,
        peer,
        track,
      });
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

    let remoteVideoStats = HMSEncoder.encodeHMSRemoteVideoStats(
      data.remoteVideoStats
    );
    let peer = HMSEncoder.encodeHmsPeer(data.peer);
    let track = HMSEncoder.encodeHmsRemoteVideoTrack(data.track, this.id);

    if (this.onRemoteVideoStatsDelegate) {
      logger?.verbose('#Listener onRemoteVideoStatsListener_CALL', {
        ...data,
        remoteVideoStats,
        peer,
        track,
      });
      this.onRemoteVideoStatsDelegate({
        ...data,
        remoteVideoStats,
        peer,
        track,
      });
    }
  };

  onAudioDeviceChangedListener = (data: {
    id: string;
    device: string;
    audioDevicesList: string[];
  }) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onAudioDeviceChangedDelegate) {
      logger?.verbose('#Listener onAudioDeviceChangedListener_CALL', data);
      this.onAudioDeviceChangedDelegate({
        ...data,
      });
    }
  };

  onSessionStoreAvailableListener = (data: { id: string }) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onSessionStoreAvailableDelegate) {
      logger?.verbose(
        '#Listener ON_SESSION_STORE_AVAILABLE_LISTENER_CALL',
        data
      );
      this.onSessionStoreAvailableDelegate({
        ...data,
        sessionStore: new HMSSessionStore(),
      });
    }
  };

  onPIPRoomLeaveListener = (data: { id: string }) => {
    if (data.id !== this.id) {
      return;
    }

    this.roomLeaveCleanup();

    if (this.onPIPRoomLeaveDelegate) {
      logger?.verbose('#Listener onPIPRoomLeave_CALL', data);
      this.onPIPRoomLeaveDelegate({
        ...data,
      });
    }
  };

  async isPipModeSupported(): Promise<undefined | boolean> {
    return HMSManager.handlePipActions('isPipModeSupported', { id: this.id });
  }

  async enablePipMode(data?: PIPConfig): Promise<undefined | boolean> {
    return HMSManager.handlePipActions('enablePipMode', {
      ...data,
      id: this.id,
    });
  }

  async setPipParams(data?: PIPConfig): Promise<undefined | boolean> {
    return HMSManager.handlePipActions('setPictureInPictureParams', {
      ...data,
      id: this.id,
    });
  }

  /**
   * - Returns the instance of logger which can be used to manipulate log levels.
   * @returns @instance HMSLogger
   * @memberof HMSSDK
   */
  static getLogger() {
    return getLogger();
  }

  /**
   * - Updates the logger for this instance of HMSSDK
   * @param {HMSLogger} hmsLogger
   * @memberof HMSSDK
   */
  setLogger = (hmsLogger?: HMSLogger) => {
    setLogger(this.id, hmsLogger);
  };
}
