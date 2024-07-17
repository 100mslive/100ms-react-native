import React from 'react';
import { Platform } from 'react-native';
import { HMSEncoder } from './HMSEncoder';
import { HMSHelper } from './HMSHelper';
import { getLogger, logger, setLogger } from './HMSLogger';
import { HMSUpdateListenerActions } from './HMSUpdateListenerActions';
import { HmsViewComponent } from './HmsView';

import HMSManager from '../modules/HMSManagerModule';

import type { HMSTrackType } from './HMSTrackType';
import type { HmsComponentProps } from './HmsView';
import type { HMSConfig } from './HMSConfig';
import type { HMSLocalPeer } from './HMSLocalPeer';
import type { HMSRemotePeer } from './HMSRemotePeer';
import type { HMSRoom } from './HMSRoom';
import type { HMSRole } from './HMSRole';
import type { HMSTrack } from './HMSTrack';
import type { HMSLogger } from './HMSLogger';
import type { HMSPeer } from './HMSPeer';
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
import { HMSPeerUpdate, HMSPeerUpdateOrdinals } from './HMSPeerUpdate';
import { HMSSessionStore } from './HMSSessionStore';
import type { HMSPeerListIteratorOptions } from './HMSPeerListIteratorOptions';
import { HMSPeerListIterator } from './HMSPeerListIterator';
import type { HMSPIPConfig } from './HMSPIPConfig';
import { HMSInteractivityCenter } from './HMSInteractivityCenter';
import type { HMSHLSTimedMetadata } from './HMSHLSTimedMetadata';
import type { HMSVideoTrack } from './HMSVideoTrack';

type HmsViewProps = Omit<HmsComponentProps, 'id'>;

const ReactNativeVersion = require('react-native/Libraries/Core/ReactNativeVersion');

let HmsSdk: HMSSDK | undefined;

export class HMSSDK {
  id: string;
  private _interactivityCenter: HMSInteractivityCenter | null = null;

  private appStateSubscription?: any;
  private onPreviewDelegate?: any;
  private onJoinDelegate?: any;
  private onRoomDelegate?: any;
  private onTranscriptsDelegate?: any;
  private onPeerDelegate?: any;
  private onPeerListUpdatedDelegate?: any;
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
  private onPIPModeChangedDelegate?: any;

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
   * Asynchronously builds and returns an instance of the HMSSDK class.
   *
   * This method initializes the HMSSDK with optional configuration parameters and returns the initialized instance.
   * It is responsible for setting up the SDK with specific settings for track management, app groups, extensions for iOS screen sharing,
   * logging configurations, etc.
   *
   *
   * @param {Object} params - Optional configuration parameters for initializing the HMSSDK.
   * @param {trackSettings} params.trackSettings is an optional value only required to enable features like iOS Screen/Audio Share, Android Software Echo Cancellation, etc
   * @param {appGroup} params.appGroup is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
   * @param {preferredExtension} params.preferredExtension is an optional value only required for implementing Screen & Audio Share on iOS. They are not required for Android. DO NOT USE if your app does not implements Screen or Audio Share on iOS.
   * @param {HMSLogSettings} params.logSettings - Optional settings for logging.
   *
   * @returns {Promise<HMSSDK>} A promise that resolves to an instance of HMSSDK.
   * @throws {Error} If the HMSSDK instance cannot be created.
   *
   * @example
   * // Regular usage:
   * const hmsInstance = await HMSSDK.build();
   *
   * @example
   * // Advanced Usage:
   * const hmsInstance = await HMSSDK.build({
   *   trackSettings: {...},
   *   appGroup: 'group.example',
   *   preferredExtension: 'com.example.extension',
   *   logSettings: {...},
   *   isPrebuilt: true
   * });
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/install-the-sdk/hmssdk
   * @static async build - Asynchronously builds and returns an instance of the HMSSDK class.
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
   * Asynchronously destroys the HMSSDK instance.
   *
   * - This method performs a series of cleanup actions before destroying the HMSSDK instance.
   * - It logs the destruction process, clears both the HMS peers and room caches, removes all event listeners to prevent memory leaks, and finally calls the native
   * `destroy` method on the `HMSManager` with the instance's ID.
   * - This is typically used to ensure that all resources are properly released when the HMSSDK instance is no longer needed, such as when a user leaves a room or the application is shutting down.
   *
   * @returns {Promise<void>} A promise that resolves when the destruction process has completed.
   * @throws {Error} If the HMSSDK instance cannot be destroyed.
   *
   * @example
   * await hmsInstance.destroy();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/install-the-sdk/hmssdk
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
   * Asynchronously retrieves an authentication token using the room code, user ID, and endpoint.
   *
   * This method is responsible for fetching an authentication token that is required to join a room in the HMS ecosystem.
   * It makes a call to the HMSManager's `getAuthTokenByRoomCode` method, passing in the necessary parameters.
   * The function logs the attempt and returns the token as a string.
   *
   * @param {string} roomCode - The unique code of the room for which the token is being requested.
   * @param {string} [userId] - Optional. The user ID of the participant requesting the token. This can be used for identifying the user in the backend.
   * @param {string} [endpoint] - Optional. The endpoint URL to which the token request is sent. This can be used to specify a different authentication server if needed.
   * @returns {Promise<string>} A promise that resolves to the authentication token as a string.
   * @throws {Error} If the authentication token cannot be retrieved.
   * @example
   * const authToken = await hmsInstance.getAuthTokenByRoomCode('room-code');
   *
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/get-methods#getauthtokenbyroomcode
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
   * Asynchronously joins a room with the provided configuration
   *
   * This method is responsible for initiating the process of joining a room in the HMS ecosystem. It performs several key actions:
   * - Logs the attempt to join with the provided configuration and instance ID.
   * - Initializes the peers and room caches for the current session.
   * - Calls the `join` method on the `HMSManager` with the provided configuration and the instance ID.
   *
   * @param {HMSConfig} config - The configuration object required to join a room. This includes credentials, room details, and user information.
   * @returns {Promise<void>} A promise that resolves when the join operation has been successfully initiated.
   * @throws {Error} If the join operation cannot be completed.
   *
   * @example
   * await hmsInstance.join(hmsConfig);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/join
   * @memberof HMSSDK
   */
  join = async (config: HMSConfig) => {
    logger?.verbose('#Function join', { config, id: this.id });
    setHmsPeersCache(new HMSPeersCache(this.id));
    setHmsRoomCache(new HMSRoomCache(this.id));
    await HMSManager.join({ ...config, id: this.id });
  };

  /**
   * Initiates a preview for the local peer.
   *
   * This function triggers the preview process for the local peer, allowing the application to display
   * preview tracks (e.g., video or audio tracks) before joining a room. The response from the previewListener
   * will contain the preview tracks for the local peer, which can be used to render a preview UI.
   *
   * @param {HMSConfig} config - The configuration object required for previewing, including credentials and user details.
   * @example
   * // Example usage of the preview function
   * const previewConfig = {
   *   authToken: "your_auth_token",
   *   userName: "John Doe",
   *   roomCode: "your_room_code"
   * };
   * hmsInstance.preview(previewConfig);
   *
   * @see https://www.100ms.live/docs/react-native/v2/features/preview
   *
   * @async
   * @function preview
   * @memberof HMSSDK
   */
  preview = async (config: HMSConfig) => {
    logger?.verbose('#Function preview', { config, id: this.id });
    await HMSManager.preview({ ...config, id: this.id });
  };

  /**
   * `HmsView` is a React component that renders a video track within a view.
   *
   * It utilizes the `HmsViewComponent` to display the media track specified by the `trackId`.
   * This component is designed to be used with React's `forwardRef` to allow for ref forwarding,
   * enabling direct interaction with the DOM element.
   *
   * Props:
   * - `trackId`: The unique identifier for the track to be displayed.
   * - `style`: Custom styles to apply to the view.
   * - `mirror`: If true, the video will be mirrored; commonly used for local video tracks.
   * - `scaleType`: Determines how the video fits within the bounds of the view (e.g., aspect fill, aspect fit).
   * - `setZOrderMediaOverlay`: When true, the video view will be rendered above the regular view hierarchy.
   * - `autoSimulcast`: Enables automatic simulcast layer switching based on network conditions (if supported).
   *
   * @param {Object} props - The properties passed to the HmsView component.
   * @param {React.Ref} ref - A ref provided by `forwardRef` for accessing the underlying DOM element.
   * @returns {React.Element} A `HmsViewComponent` element configured with the provided props and ref.
   * @memberof HMSSDK
   * @example
   * <HmsView trackId="track-id" style={{ width: 100, height: 100 }} mirror={true} scaleType="aspectFill" />
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/overview
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
    this?.appStateSubscription?.remove();
    clearHmsPeersCache();
    clearHmsRoomCache();
    HMSEncoder.clearData(); // Clearing cached data in encoder
  };

  /**
   * Asynchronously leaves the current room and performs cleanup.
   *
   * This method triggers the leave process for the current user, effectively disconnecting them from the room they are in.
   * It logs the leave action with the user's ID, calls the native `leave` method in `HMSManager` with the user's ID,
   * and then performs additional cleanup through `roomLeaveCleanup`. This cleanup includes removing app state subscriptions
   * and clearing cached data related to peers and the room.
   *
   * @returns {Promise<any>} A promise that resolves with the operation result once the leave process is complete.
   * @memberof HMSSDK
   * @example
   * await hmsInstance.leave();
   *
   * @see https://www.100ms.live/docs/react-native/v2/features/leave
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
   * Sends a broadcast message to all peers in the room.
   *
   * This asynchronous function sends a message to all peers in the room, which they can receive through the `onMessage` listener.
   * It can be used to send chat messages or custom types of messages like emoji reactions or notifications.
   *
   * @param {string} message - The message to be sent to all peers.
   * @param {string} [type='chat'] - The type of the message. Default is 'chat'. Custom types can be used for specific purposes.
   * @returns {Promise<{messageId: string | undefined}>} A promise that resolves with the message ID of the sent message, or undefined if the message could not be sent.
   *
   * @example
   * // Sending a chat message to all peers
   * await hmsInstance.sendBroadcastMessage("Hello everyone!", "chat");
   *
   * @example
   * // Sending a custom notification to all peers
   * await hmsInstance.sendBroadcastMessage("Meeting starts in 5 minutes", "notification");
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/chat
   *
   * @memberof HMSSDK
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
   * Sends a message to a specific set of roles within the room.
   *
   * This method allows for targeted communication by sending a message to peers who have any of the specified roles.
   * The message is received by the peers through the `onMessage` listener. This can be useful for sending announcements,
   * instructions, or other types of messages to a subset of the room based on their roles.
   *
   * @param {string} message - The message to be sent.
   * @param {HMSRole[]} roles - An array of roles to which the message will be sent. Peers with these roles will receive the message.
   * @param {string} [type='chat'] - The type of the message. Defaults to 'chat'. Custom types can be used for specific messaging scenarios.
   * @returns {Promise<{messageId: string | undefined}>} A promise that resolves with an object containing the `messageId` of the sent message. If the message could not be sent, `messageId` will be `undefined`.
   *
   * @example
   * // Sending a message to all peers with the role of 'moderator'
   * await hmsInstance.sendGroupMessage("Please start the meeting.", [moderator]);
   *
   * @see https://www.100ms.live/docs/react-native/v2/features/chat
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
   * Sends a direct message to a specific peer in the room.
   *
   * This method allows sending a private message to a single peer, ensuring that only the specified recipient can receive and view the message.
   * The message is delivered to the recipient through the `onMessage` listener. This functionality is useful for implementing private chat features
   * within a larger group chat context.
   *
   * @param {string} message - The message text to be sent.
   * @param {HMSPeer} peer - The peer object representing the recipient of the message.
   * @param {string} [type='chat'] - The type of the message being sent. Defaults to 'chat'. This can be customized to differentiate between various message types (e.g., 'private', 'system').
   * @returns {Promise<{messageId: string | undefined}>} A promise that resolves with an object containing the `messageId` of the sent message. If the message could not be sent, `messageId` will be `undefined`.
   * @throws {Error} Throws an error if the message could not be sent.
   *
   * @example
   * // Sending a private chat message to a specific peer
   * const peer = { peerID: 'peer123', ... };
   * await hmsInstance.sendDirectMessage("Hello, this is a private message.", peer, "chat");
   *
   * @see https://www.100ms.live/docs/react-native/v2/features/chat
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
   * Asynchronously changes the metadata for the local peer.
   *
   * This method updates the metadata field of the local peer in the room. The metadata is a versatile field that can be used
   * to store various information such as the peer's current status (e.g., raising hand, be right back, etc.). It is recommended
   * to use a JSON object in string format to store multiple data points within the metadata. This allows for a structured and
   * easily parseable format for metadata management.
   *
   * @param {string} metadata - The new metadata in string format. It is advised to use a JSON string for structured data.
   * @returns {Promise<void>} A promise that resolves when the metadata has been successfully changed.
   * @throws {Error} Throws an error if the metadata change operation fails.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-metadata
   * @example
   * // Changing metadata to indicate the peer is raising their hand
   * const newMetadata = JSON.stringify({ status: 'raiseHand' });
   * await hmsInstance.changeMetadata(newMetadata);
   *
   * @memberof HMSSDK
   */
  changeMetadata = async (metadata: string) => {
    logger?.verbose('#Function changeMetadata', { metadata, id: this.id });
    return await HMSManager.changeMetadata({ metadata, id: this.id });
  };

  /**
   * Initiates RTMP streaming or recording based on the provided configuration.
   *
   * This method starts RTMP streaming or recording by taking a configuration object of type HMSRTMPConfig.
   * The configuration specifies the URLs for streaming and whether recording should be enabled. The response to this
   * operation can be observed in the `onRoomUpdate` event, specifically when the `RTMP_STREAMING_STATE_UPDATED` action is triggered.
   *
   * @param {HMSRTMPConfig} data - The configuration object for RTMP streaming or recording. It includes streaming URLs and recording settings.
   * @returns {Promise<any>} A promise that resolves with the operation result when the streaming or recording starts successfully.
   * @throws {Error} Throws an error if the operation fails or the configuration is invalid.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/recording
   *
   * @example
   * const rtmpConfig = {
   *   meetingURL: "https://meet.example.com/myMeeting",
   *   rtmpURLs: ["rtmp://live.twitch.tv/app", "rtmp://a.rtmp.youtube.com/live2"],
   *   record: true,
   *   resolution: { width: 1280, height: 720 }
   * };
   * await hmsInstance.startRTMPOrRecording(rtmpConfig);
   * @async
   * @function startRTMPOrRecording
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
   * Stops all ongoing RTMP streaming and recording.
   *
   * This function is responsible for halting any active RTMP streaming or recording sessions.
   * It communicates with the native `HMSManager` module to execute the stop operation.
   * The completion or status of this operation can be monitored through the `onRoomUpdate` event, specifically when the `RTMP_STREAMING_STATE_UPDATED` action is triggered, indicating that the streaming or recording has been successfully stopped.
   *
   * @async
   * @function stopRtmpAndRecording
   * @returns {Promise<any>} A promise that resolves when the RTMP streaming and recording have been successfully stopped.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/recording
   * @memberof HMSSDK
   * @example
   * await hmsInstance.stopRtmpAndRecording();
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
   * send timed metadata for HLS player
   * @param metadata list of {@link HMSHLSTimedMetadata} to be sent
   * @returns Promise<boolean>
   */
  sendHLSTimedMetadata = async (
    metadata: HMSHLSTimedMetadata[]
  ): Promise<boolean> => {
    const data = { metadata, id: this.id };
    logger?.verbose('#Function sendHLSTimedMetadata', data);
    return await HMSManager.sendHLSTimedMetadata(data);
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
   * Sets the audio mixing mode for the current session. Android only.
   *
   * This asynchronous function is used to change the mode of audio mixing during a session. It is currently
   * available only for Android. The function logs the action with the instance ID and the specified audio mixing mode,
   * then calls the native `setAudioMixingMode` method in `HMSManager` with the provided parameters.
   *
   * If the platform is not Android, it logs a message indicating that the API is not available for iOS.
   *
   * @param {HMSAudioMixingMode} audioMixingMode - The audio mixing mode to be set.
   * @returns {Promise<string>} A promise that resolves to a string indicating the success of the operation
   *                            or a message stating the API is not available for iOS.
   * @example
   * await hmsInstance.setAudioMixingMode(HMSAudioMixingMode.TALK_AND_MUSIC);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   *
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
   * - This wrapper function used to switch output to device other than the default route.
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

    return HMSManager.switchAudioOutput({ id: this.id, audioDevice });
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
    return HMSManager.lowerLocalPeerHand(data);
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

  /**
   * `getPeerListIterator` method returns an instance of `HMSPeerListIterator` class
   *
   * @param options options for configuring iterator
   * @returns instance of HMSPeerListIterator class
   *
   * Example usage:
   * ```
   * const peerListIterator =  hmsInstance.getPeerListIterator();
   * ```
   * OR
   * ```
   * const peerListIterator =  hmsInstance.getPeerListIterator({
   *    limit: 10,
   *    byRoleName: 'viewer-realtime',
   * });
   * ```
   */
  getPeerListIterator = (
    options?: HMSPeerListIteratorOptions
  ): HMSPeerListIterator => {
    logger?.verbose('#Function getPeerListIterator', {
      id: this.id,
      options,
    });

    const uniqueId = Math.random().toString(16).slice(2);

    const data: null | {
      sucess: boolean;
      uniqueId: string;
      totalCount: number;
    } = HMSManager.getPeerListIterator({
      id: this.id,
      ...options,
      limit: options?.limit ?? 10,
      uniqueId,
    });

    if (!data) {
      throw new Error('Unable to create PeerListIterator');
    }

    return new HMSPeerListIterator(data.uniqueId, data.totalCount);
  };

  /**
   * - This function allows the user to set the screen on always.
   * - This is useful when the user wants to keep the screen on while the app is in the foreground.
   * @param enabled boolean value to enable or disable the always screen on
   */
  setAlwaysScreenOn = async (enabled: boolean) => {
    logger?.verbose('#Function toggleAlwaysScreenOn', {
      id: this.id,
      enabled,
    });
    return HMSManager.setAlwaysScreenOn({ id: this.id, enabled });
  };

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
      case HMSUpdateListenerActions.ON_TRANSCRIPTS: {
        // Checking if we already have ON_TRANSCRIPTS subscription
        if (
          !this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRANSCRIPTS]
        ) {
          // Adding ON_TRANSCRIPTS native listener
          const transcriptsSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSUpdateListenerActions.ON_TRANSCRIPTS,
            this.onTranscriptsListener
          );
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRANSCRIPTS] =
            transcriptsSubscription;
        }
        // Adding App Delegate listener
        this.onTranscriptsDelegate = callback;
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
      case HMSUpdateListenerActions.ON_PEER_LIST_UPDATED: {
        // Checking if we already have ON_PEER_LIST_UPDATED subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PEER_LIST_UPDATED
          ]
        ) {
          // Adding ON_PEER_LIST_UPDATED native listener
          const peerListUpdatedSubscription =
            HMSNativeEventListener.addListener(
              this.id,
              HMSUpdateListenerActions.ON_PEER_LIST_UPDATED,
              this.onPeerListUpdatedListener
            );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PEER_LIST_UPDATED
          ] = peerListUpdatedSubscription;
        }
        // Adding App Delegate listener
        this.onPeerListUpdatedDelegate = callback;
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
      case HMSPIPListenerActions.ON_PIP_MODE_CHANGED: {
        // Checking if we already have ON_PIP_MODE_CHANGED subscription
        if (
          !this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_MODE_CHANGED]
        ) {
          const pipModeChangedSubscription = HMSNativeEventListener.addListener(
            this.id,
            HMSPIPListenerActions.ON_PIP_MODE_CHANGED,
            this.onPIPModeChangedListener
          );
          this.emitterSubscriptions[HMSPIPListenerActions.ON_PIP_MODE_CHANGED] =
            pipModeChangedSubscription;
        }
        // Adding PIP mode changed Delegate listener
        this.onPIPModeChangedDelegate = callback;

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
      case HMSUpdateListenerActions.ON_TRANSCRIPTS: {
        const subscription =
          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRANSCRIPTS];
        // Removing ON_TRANSCRIPTS native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[HMSUpdateListenerActions.ON_TRANSCRIPTS] =
            undefined;
        }
        // Removing App Delegate listener
        this.onTranscriptsDelegate = null;
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
      case HMSPIPListenerActions.ON_PIP_MODE_CHANGED: {
        if (Platform.OS === 'android') {
          const subscription =
            this.emitterSubscriptions[
              HMSPIPListenerActions.ON_PIP_MODE_CHANGED
            ];
          // Removing ON_PIP_MODE_CHANGED native listener
          if (subscription) {
            subscription.remove();

            this.emitterSubscriptions[
              HMSPIPListenerActions.ON_PIP_MODE_CHANGED
            ] = undefined;
          }
          // Removing App Delegate listener
          this.onPIPModeChangedDelegate = null;
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

  onTranscriptsListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    HMSEncoder.transformTranscripts(data.transcripts);

    if (this.onTranscriptsDelegate) {
      logger?.verbose('#Listener ON_TRANSCRIPTS_LISTENER_CALL', data);
      this.onTranscriptsDelegate(data);
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

    if (type === HMSPeerUpdate.PEER_LEFT) {
      this.sendPeerUpdateWhenPeerLeaves(data, peer, type);
    } else {
      getHmsPeersCache()?.updatePeerCache(data.peer.peerID, data.peer, type);
      this.sendPeerUpdate(peer, type);
    }
  };

  private sendPeerUpdate = (peer: any, type: any) => {
    if (this.onPeerDelegate) {
      logger?.verbose('#Listener ON_PEER_LISTENER_CALL', {
        peer,
        type,
      });
      this.onPeerDelegate({ peer, type });
    }
  };

  private sendPeerUpdateWhenPeerLeaves = (data: any, peer: any, type: any) => {
    this.sendPeerUpdate(peer, type);

    getHmsPeersCache()?.updatePeerCache(data.peer.peerID, data.peer, type);
  };

  onPeerListUpdatedListener = (data: any) => {
    if (data.id !== this.id) {
      return;
    }
    const addedPeers = HMSEncoder.encodeHmsPeers(data.addedPeers);
    const removedPeers = HMSEncoder.encodeHmsPeers(data.removedPeers);

    if (this.onPeerListUpdatedDelegate) {
      logger?.verbose('#Listener ON_PEER_LIST_UPDATED_LISTENER_CALL', {
        totalAddedPeers: addedPeers.length,
        totalRemovedPeers: removedPeers.length,
      });

      this.onPeerListUpdatedDelegate({
        addedPeers,
        removedPeers,
      });
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

  /**
   * Listener for the `SessionStoreAvailable` event.
   *
   * This listener is triggered when the session store becomes available in the SDK. It is an important event
   * for developers who need to access or manipulate the session store after it has been initialized and made available.
   *
   * @param {Object} data - The event data.
   * @param {HMSSessionStore} data.sessionStore - The session store object that has been made available.
   */
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

  /**
   * Listener for the `PIPRoomLeave` event. Android only.
   *
   * This listener is triggered when a room is left from the Picture in Picture (PIP) mode, which is currently supported only on Android platforms.
   * It is an essential event for handling cleanup or UI updates when the user exits the room while in PIP mode.
   * @param {Object} data - The event data.
   * @memberof HMSSDK
   * @example
   * // Example of handling the `PIPRoomLeave` event
   * hms.onPIPRoomLeave((data) => {
   * // Handle PIP room leave event
   * });
   *
   */
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

  /**
   * Listener for the `PIPModeChanged` event.
   * This listener is triggered when the Picture in Picture (PIP) mode is toggled on or off.
   * It is an important event for handling UI updates or other actions when the user enters or exits PIP mode.
   * @param {Object} data - The event data.
   * @param {boolean} data.isInPictureInPictureMode - A boolean value indicating whether the user is currently in PIP mode.
   * @returns {void} - Returns nothing.
   * @memberof HMSSDK
   * @example
   * // Example of handling the `PIPModeChanged` event
   * hms.onPIPModeChanged((data) => {
   *  if (data.isInPictureInPictureMode) {
   *  // Handle PIP mode enabled
   *  } else {
   *  // Handle PIP mode disabled
   *  }
   *  });
   */
  onPIPModeChangedListener = (data: {
    isInPictureInPictureMode: boolean;
  }): void => {
    if (this.onPIPModeChangedDelegate) {
      logger?.verbose('#Listener onPIPModeChanged_CALL', data);

      this.onPIPModeChangedDelegate(data);
    }
  };

  /**
   * - This function is used to check if Picture in Picture mode is supported on the device
   * @returns {Promise<boolean>} - Returns a boolean value indicating whether Picture in Picture mode is supported on the device.
   * @memberof HMSSDK
   * @example
   * // Example of checking if Picture in Picture mode is supported
   * const isPipModeSupported = await hms.isPipModeSupported();
   * if (isPipModeSupported) {
   * // Picture in Picture mode is supported
   * } else {
   * // Picture in Picture mode is not supported
   * }
   * @example
   * // Example of checking if Picture in Picture mode is supported
   * hms.isPipModeSupported().then((isPipModeSupported) => {
   * if (isPipModeSupported) {
   * // Picture in Picture mode is supported
   * } else {
   * // Picture in Picture mode is not supported
   * }
   * });
   */
  async isPipModeSupported(): Promise<undefined | boolean> {
    const data = { id: this.id };
    logger?.verbose('#Function isPipModeSupported', data);
    return HMSManager.handlePipActions('isPipModeSupported', data);
  }

  /**
   * Asynchronously enters Picture in Picture (PIP) mode with optional configuration.
   *
   * This method attempts to enter PIP mode based on the provided configuration.
   * It returns a promise that resolves to a boolean indicating the success of the operation.
   * If PIP mode is not supported or fails to activate, the promise may resolve to `undefined` or `false`.
   *
   * @param {HMSPIPConfig} [data] - Optional configuration for entering PIP mode. This can include settings such as `autoEnterPipMode` and `aspectRatio`.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if PIP mode was successfully entered, `false` if unsuccessful or PIP mode is not supported.
   * @throws {Error} - Throws an error if the operation fails.
   * @memberof HMSSDK
   * @example
   * // Example of entering Picture in Picture mode
   * hms.enterPipMode().then((success) => {
   * if (success) {
   * // Picture in Picture mode entered successfully
   * } else {
   * // Picture in Picture mode could not be entered
   * }
   * });
   * @example
   * // Example of entering Picture in Picture mode with configuration
   * const success = await hms.enterPipMode({ autoEnterPipMode: true, aspectRatio: [16,9] });
   * if (success) {
   * // Picture in Picture mode entered successfully
   * } else {
   * // Picture in Picture mode could not be entered
   * }
   *
   */
  async enterPipMode(data?: HMSPIPConfig): Promise<boolean> {
    logger?.verbose('#Function enterPipMode', data);
    return HMSManager.handlePipActions('enterPipMode', {
      ...data,
      id: this.id,
    });
  }

  /**
   * Asynchronously sets the parameters for Picture in Picture (PIP) mode.
   *
   * This method configures the PIP window according to the provided `HMSPIPConfig` settings. It can be used to adjust various aspects of the PIP mode, such as its size, aspect ratio, and more. The method returns a promise that resolves to a boolean indicating the success of the operation. If the PIP mode is not supported or the configuration fails, the promise may resolve to `undefined` or `false`.
   *
   * @param {HMSPIPConfig} [data] - Optional configuration for setting PIP mode parameters. This can include settings such as `aspectRatio`, `autoEnterPipMode`, etc.
   * @returns {Promise<boolean | undefined>} - A promise that resolves to `true` if the PIP parameters were successfully set, `false` if unsuccessful. `undefined` may be returned if PIP mode is not supported.
   * @throws {Error} - Throws an error if the operation fails.
   * @memberof HMSSDK
   * @example
   * // Example of setting Picture in Picture mode parameters
   * hms.setPipParams({ aspectRatio: [16, 9], autoEnterPipMode: true }).then((success) => {
   * if (success) {
   * // Picture in Picture mode parameters set successfully
   * } else {
   * // Picture in Picture mode parameters could not be set
   * }
   * });
   */
  async setPipParams(data?: HMSPIPConfig): Promise<boolean | undefined> {
    return HMSManager.handlePipActions('setPictureInPictureParams', {
      ...data,
      id: this.id,
    });
  }

  /**
   * Changes the video track used in Picture in Picture (PIP) mode on iOS devices.
   *
   * This function is specifically designed for iOS platforms to switch the video track displayed in PIP mode.
   * It takes a `HMSVideoTrack` object as an argument, which contains the track ID of the video track to be displayed in PIP mode.
   * This allows for dynamic changes to the video source in PIP mode, enhancing the flexibility of video presentation in applications that support PIP.
   *
   * @param {HMSVideoTrack} track - The video track to be used in PIP mode. Must contain a valid `trackId`.
   * @returns {Promise} - A promise that resolves when the video track has been successfully changed for PIP mode, or rejects with an error if the operation fails.
   * @throws {Error} - Throws an error if the operation fails.
   * @memberof HMSSDK
   * @example
   * // Example of changing the video track for PIP mode on iOS
   * hms.changeIOSPIPVideoTrack(videoTrack).then(() => {
   *   console.log('Video track for PIP mode changed successfully');
   * }).catch(error => {
   *   console.error('Failed to change video track for PIP mode', error);
   * });
   */
  async changeIOSPIPVideoTrack(track: HMSVideoTrack): Promise<any> {
    const data = {
      id: this.id,
      trackId: track.trackId,
    };
    logger?.verbose('#Function changeIOSPIPVideoTrack', data);
    return await HMSManager.changeIOSPIPVideoTrack(data);
  }

  /**
   * - Use this function to automatically show the current Active Speaker Peer video in the PIP Mode window. iOS Only.
   * - This function is used to automatically switch the video track of the active speaker to the Picture in Picture (PIP) mode window on iOS devices.
   * - When enabled, the video track of the active speaker will be displayed in the PIP mode window, providing a focused view of the current speaker during a meeting or conference.
   * @param {boolean} enable - A boolean value indicating whether to enable or disable the automatic switching of the active speaker video track in PIP mode.
   * @returns {Promise} - A promise that resolves when the operation is successful, or rejects with an error if the operation fails.
   * @throws {Error} - Throws an error if the operation fails.
   * @memberof HMSSDK
   * @example
   * // Example of enabling the automatic switching of the active speaker video track in PIP mode
   * hms.setActiveSpeakerInIOSPIP(true).then(() => {
   *  console.log('Active speaker video track enabled in PIP mode');
   *  }).catch(error => {
   *  console.error('Failed to enable active speaker video track in PIP mode', error);
   *  });
   */
  async setActiveSpeakerInIOSPIP(enable: boolean): Promise<any> {
    const data = {
      id: this.id,
      enable,
    };
    logger?.verbose('#Function setActiveSpeakerInIOSPIP', data);
    return await HMSManager.setActiveSpeakerInIOSPIP(data);
  }

  async startRealTimeTranscription() {
    const data = {
      id: this.id,
      action: 'start',
    };
    logger?.verbose('#Function startRealTimeTranscription', data);
    return HMSManager.handleRealTimeTranscription(data);
  }

  async stopRealTimeTranscription() {
    const data = {
      id: this.id,
      action: 'stop',
    };
    logger?.verbose('#Function stopRealTimeTranscription', data);
    return HMSManager.handleRealTimeTranscription(data);
  }

  get interactivityCenter() {
    if (!this._interactivityCenter) {
      this._interactivityCenter = new HMSInteractivityCenter();
    }
    return this._interactivityCenter;
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
