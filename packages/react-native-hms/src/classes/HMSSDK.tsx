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
import type { HMSRemoteVideoTrack } from './HMSRemoteVideoTrack';
import type { HMSRemoteAudioTrack } from './HMSRemoteAudioTrack';

type HmsViewProps = Omit<HmsComponentProps, 'id'>;

const ReactNativeVersion = require('react-native/Libraries/Core/ReactNativeVersion');

let HmsSdk: HMSSDK | undefined;

/**
 * Represents the main SDK class for the 100ms (HMS) video conferencing service in a React Native application.
 * This class provides methods to manage the video conferencing lifecycle including joining a room, leaving a room,
 * managing streams, and handling events.
 *
 * @export
 * @class HMSSDK
 * @example
 * const hmsInstance = await HMSSDK.build();
 * await hmsInstance.join({ authToken: 'your_auth_token', username: 'John Appleseed' });
 * @see https://www.100ms.live/docs/react-native/v2/quickstart/quickstart
 */
export class HMSSDK {
  id: string;
  private _interactivityCenter: HMSInteractivityCenter | null = null;

  private appStateSubscription?: any;
  private onPreviewDelegate?: any;
  private onJoinDelegate?: any;
  private onPermissionsRequestedDelegate?: any;
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
   * @param {boolean} params.haltPreviewJoinForPermissionsRequestOnAndroid - Optional flag to halt the preview/join process until permissions are explicitly granted by the user. Android only. This is particularly useful when you might want to request permissions before proceeding with the preview or join operation.
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
   * });
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/install-the-sdk/hmssdk
   * @static
   * @async
   * @function build
   * @memberof HMSSDK
   */
  static async build(params?: {
    trackSettings?: HMSTrackSettings;
    haltPreviewJoinForPermissionsRequestOnAndroid?: boolean;
    appGroup?: String;
    preferredExtension?: String;
    logSettings?: HMSLogSettings;
    isPrebuilt?: boolean;
  }) {
    const { version } = require('../../package.json');
    const { major, minor, patch } = ReactNativeVersion.version;
    let id = await HMSManager.build({
      trackSettings: params?.trackSettings,
      haltPreviewJoinForPermissionsRequest:
        params?.haltPreviewJoinForPermissionsRequestOnAndroid, // required for Android Permissions, not required for iOS
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
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/get-methods#getauthtokenbyroomcode
   * @async
   * @function getAuthTokenByRoomCode
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
   * @async
   * @function join
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
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user has successfully left the room, or `false` otherwise.
   * @throws {Error} If the user cannot leave the room.
   * @memberof HMSSDK
   * @example
   * await hmsInstance.leave();
   *
   * @see https://www.100ms.live/docs/react-native/v2/features/leave
   *
   * @async
   * @function leave
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
   * @async
   * @function sendBroadcastMessage
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
   * @async
   * @function sendGroupMessage
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
   * @async
   * @function sendDirectMessage
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
   * @async
   * @function changeMetadata
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
   * Initiates HLS (HTTP Live Streaming) based on the provided configuration.
   *
   * This asynchronous function starts HLS streaming, allowing for live video content to be delivered over the internet in a scalable manner.
   * The function takes an optional `HMSHLSConfig` object as a parameter, which includes settings such as the meeting URL, HLS variant parameters, and recording settings.
   * The operation's response can be observed through the `onRoomUpdate` event, specifically when the `HLS_STREAMING_STATE_UPDATED` action is triggered, indicating the streaming state has been updated.
   *
   * @param {HMSHLSConfig} [data] - Optional configuration object for HLS streaming. Defines parameters such as meeting URL, HLS variants, and recording options.
   * @returns {Promise<any>} A promise that resolves when the HLS streaming starts successfully. The promise resolves with the operation result.
   * @throws {Error} Throws an error if the operation fails or if the provided configuration is invalid.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/hls
   * @async
   * @function startHLSStreaming
   * @memberof HMSSDK
   * @example
   * await hmsInstance.startHLSStreaming();
   */
  startHLSStreaming = async (data?: HMSHLSConfig) => {
    logger?.verbose('#Function startHLSStreaming', {
      ...data,
      id: this.id,
    });
    return await HMSManager.startHLSStreaming({ ...data, id: this.id });
  };

  /**
   * Stops the ongoing HLS (HTTP Live Streaming) streams.
   *
   * This asynchronous function is responsible for stopping any active HLS streaming sessions.
   * It communicates with the native `HMSManager` module to execute the stop operation.
   * The completion or status of this operation can be observed through the `onRoomUpdate` event, specifically when the `HLS_STREAMING_STATE_UPDATED` action is triggered, indicating that the HLS streaming has been successfully stopped.
   *
   * @async
   * @function stopHLSStreaming
   * @returns {Promise<void>} A promise that resolves when the HLS streaming has been successfully stopped.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/hls for more details on HLS streaming.
   * @memberof HMSSDK
   * @example
   * await hmsInstance.stopHLSStreaming();
   */
  stopHLSStreaming = async () => {
    logger?.verbose('#Function stopHLSStreaming', {});
    return await HMSManager.stopHLSStreaming({ id: this.id });
  };

  /**
   * Sends timed metadata for HLS (HTTP Live Streaming) playback.
   *
   * This asynchronous function is designed to send metadata that can be synchronized with the HLS video playback.
   * The metadata is sent to all viewers of the HLS stream, allowing for a variety of use cases such as displaying
   * song titles, ads, or other information at specific times during the stream.
   * The metadata should be an array of HMSHLSTimedMetadata objects, each specifying the content and timing for the metadata display.
   *
   * @async
   * @function sendHLSTimedMetadata
   * @param {HMSHLSTimedMetadata[]} metadata - An array of metadata objects to be sent.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the metadata was successfully sent, or `false` otherwise.
   * @example
   * const metadata = [
   *   { time: 10, data: "Song: Example Song Title" },
   *   { time: 20, data: "Advertisement: Buy Now!" }
   * ];
   * await hmsInstance.sendHLSTimedMetadata(metadata);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/record-and-live-stream/hls-player#how-to-use-hls-timed-metadata-with-100ms-hls-player
   */
  sendHLSTimedMetadata = async (
    metadata: HMSHLSTimedMetadata[]
  ): Promise<boolean> => {
    const data = { metadata, id: this.id };
    logger?.verbose('#Function sendHLSTimedMetadata', data);
    return await HMSManager.sendHLSTimedMetadata(data);
  };

  /**
   * Deprecated. Changes the role of a specified peer within the room.
   *
   * This function is marked as deprecated and should not be used in new implementations. Use `changeRoleOfPeer` instead.
   * It allows for the dynamic adjustment of a peer's permissions and capabilities within the room by changing their role.
   * The role change can be enforced immediately or offered to the peer as a request, depending on the `force` parameter.
   *
   * @deprecated Since version 1.1.0. Use `changeRoleOfPeer` instead.
   * @param {HMSPeer} peer - The peer whose role is to be changed.
   * @param {HMSRole} role - The new role to be assigned to the peer.
   * @param {boolean} [force=false] - If `true`, the role change is applied immediately without the peer's consent. If `false`, the peer receives a role change request.
   * @returns {Promise<void>} A promise that resolves when the role change operation is complete.
   * @throws {Error} Throws an error if the operation fails.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role
   * @example
   * // Change the role of a peer to 'viewer' forcefully
   * const peer = { peerID: 'peer123', ... };
   * const newRole = { name: 'viewer', ... };
   * await hmsInstance.changeRole(peer, newRole, true);
   * @async
   * @function changeRole
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
   * Asynchronously changes the role of a specified peer within the room.
   *
   * This function is designed to dynamically adjust a peer's permissions and capabilities within the room by changing their role.
   * It can enforce the role change immediately or offer it to the peer as a request, depending on the `force` parameter.
   * If the role change is forced, it is applied immediately without the peer's consent. Otherwise, the peer receives a role change request,
   * which can be accepted or declined. This functionality supports flexible room management and control over participant permissions.
   *
   * @async
   * @function changeRoleOfPeer
   * @param {HMSPeer} peer - The peer whose role is to be changed.
   * @param {HMSRole} role - The new role to be assigned to the peer.
   * @param {boolean} [force=false] - Determines whether the role change should be applied immediately (`true`) or sent as a request (`false`).
   * @returns {Promise<void>} A promise that resolves to `true` if the role change operation is successful, or `false` otherwise.
   * @throws {Error} Throws an error if the operation fails.
   * @see  https://www.100ms.live/docs/react-native/v2/features/change-role
   * @example
   * // Change the role of a peer to 'viewer' forcefully
   * const peer = { peerID: 'peer123', ... };
   * const newRole = { name: 'viewer', ... };
   * await hmsInstance.changeRoleOfPeer(peer, newRole, true);
   *
   * @async
   * @function changeRoleOfPeer
   * @memberof HMSSDK
   */
  changeRoleOfPeer = async (
    peer: HMSPeer,
    role: HMSRole,
    force: boolean = false
  ): Promise<void> => {
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
   * Asynchronously changes the roles of multiple peers within the room.
   *
   * This function is designed to batch update the roles of peers based on their current roles. It is particularly useful
   * in scenarios where a group of users need to be granted or restricted permissions en masse, such as promoting all viewers
   * to participants or demoting all speakers to viewers. The function updates the roles of all peers that have any of the specified
   * `ofRoles` to the new `toRole` without requiring individual consent, bypassing the `roleChangeRequest` listener on the peer's end.
   *
   * @async
   * @function changeRoleOfPeersWithRoles
   * @param {HMSRole[]} ofRoles - An array of roles to identify the peers whose roles are to be changed.
   * @param {HMSRole} toRole - The new role to be assigned to the identified peers.
   * @returns {Promise<void>} A promise that resolves when the role change operation is complete.
   * @throws {Error} Throws an error if the operation fails.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role
   * @example
   * // Change the role of all peers with 'viewer' role to 'participant'
   * const viewerRole = { name: 'viewer', ... };
   * const participantRole = { name: 'participant', ... };
   * await hmsInstance.changeRoleOfPeersWithRoles([viewerRole], participantRole);
   *
   * @memberof HMSSDK
   */
  changeRoleOfPeersWithRoles = async (
    ofRoles: HMSRole[],
    toRole: HMSRole
  ): Promise<void> => {
    const data = {
      ofRoles: ofRoles.map((ofRole) => ofRole.name).filter(Boolean),
      toRole: toRole.name,
      id: this.id,
    };
    logger?.verbose('#Function changeRoleOfPeersWithRoles', data);
    return HMSManager.changeRoleOfPeersWithRoles(data);
  };

  /**
   * Asynchronously changes the mute state of a specified track.
   *
   * This function is designed to control the mute state of any track (audio or video) within the room.
   * When invoked, it sends a request to the HMSManager to change the mute state of the specified track.
   * The targeted peer, whose track is being manipulated, will receive a callback on the `onChangeTrackStateRequestListener`,
   * allowing for custom handling or UI updates based on the mute state change.
   *
   * @async
   * @function changeTrackState
   * @param {HMSTrack} track - The track object whose mute state is to be changed.
   * @param {boolean} mute - The desired mute state of the track. `true` to mute the track, `false` to unmute.
   * @returns {Promise<void>} A promise that resolves when the operation to change the track's mute state is complete.
   * @throws {Error} Throws an error if the operation fails or the track cannot be found.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/remote-mute
   * @async
   * @function changeTrackState
   * @memberof HMSSDK
   *
   * @example
   * // Mute a specific track
   * const trackToMute = { trackId: 'track123', ... };
   * await hmsInstance.changeTrackState(trackToMute, true);
   *
   * @example
   * // Unmute a specific track
   * const trackToUnmute = { trackId: 'track456', ... };
   * await hmsInstance.changeTrackState(trackToUnmute, false);
   */
  changeTrackState = async (track: HMSTrack, mute: boolean): Promise<void> => {
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
   * Asynchronously changes the mute state of tracks for peers with specified roles.
   *
   * This method extends the functionality of `changeTrackState` by allowing the mute state of all tracks (audio, video, etc.)
   * belonging to peers with certain roles to be changed in a single operation. It is particularly useful for managing the audio
   * and video state of groups of users, such as muting all participants except the speaker in a conference call.
   *
   * The peers whose track states are being changed will receive a callback on `onChangeTrackStateRequestListener`, allowing for
   * custom handling or UI updates based on the mute state change.
   *
   * @async
   * @function changeTrackStateForRoles
   * @param {boolean} mute - The desired mute state of the tracks. `true` to mute, `false` to unmute.
   * @param {HMSTrackType} [type] - Optional. The type of the tracks to be muted/unmuted (e.g., audio, video).
   * @param {string} [source] - Optional. The source of the track (e.g., camera, screen).
   * @param {Array<HMSRole>} [roles] - The roles of the peers whose tracks are to be muted/unmuted. If not specified, affects all roles.
   * @returns {Promise<void>} A promise that resolves when the operation to change the track's mute state is complete.
   * @throws {Error} Throws an error if the operation fails.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/change-track-state-roles
   * @memberof HMSSDK
   *
   * @example
   * // Mute all audio tracks for peers with the role of 'viewer'
   * const viewerRole = { name: 'viewer', ... };
   * await hmsInstance.changeTrackStateForRoles(true, 'audio', undefined, [viewerRole]);
   */
  changeTrackStateForRoles = async (
    mute: boolean,
    type?: HMSTrackType,
    source?: string,
    roles?: Array<HMSRole>
  ): Promise<void> => {
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
   * Asynchronously removes a peer from the room.
   *
   * This method forcefully disconnects a specified peer from the room.
   * Upon successful removal, the removed peer will receive a callback through the `onRemovedFromRoomListener`, indicating
   * they have been removed from the room.
   * This can be used for managing room participants, such as removing disruptive users or managing room capacity.
   *
   * @param {HMSPeer} peer - The peer object representing the participant to be removed.
   * @param {string} reason - A string detailing the reason for the removal. This reason is communicated
   *                          to the removed peer, providing context for the action.
   * @returns {Promise<void>} A promise that resolves when the peer has been successfully removed.
   *                          If the operation fails, the promise will reject with an error.
   *
   * @example
   * // Assuming `peer` is an instance of HMSPeer representing the participant to remove
   * await hmsInstance.removePeer(peer, "Violation of room rules");
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/remove-peer
   *
   * @async
   * @function removePeer
   * @memberof HMSSDK
   */
  removePeer = async (peer: HMSPeer, reason: string): Promise<void> => {
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
   * Asynchronously ends the current room session for all participants.
   *
   * This method is used to programmatically end the current room session, effectively disconnecting all participants.
   * It can also optionally lock the room to prevent new participants from joining. This is particularly useful for
   * managing the end of scheduled events or meetings, ensuring that all participants are removed at the same time.
   * Upon successful execution, all participants will receive a notification through the `onRemovedFromRoomListener`
   * indicating that they have been removed from the room.
   *
   * @param {string} reason - A descriptive reason for ending the room session. This reason is communicated to all participants.
   * @param {boolean} [lock=false] - Optional. Specifies whether the room should be locked after ending the session. Default is `false`.
   * @returns {Promise<void>} A promise that resolves when the room has been successfully ended and, optionally, locked.
   *
   * @example
   * // End the room and lock it to prevent rejoining
   * await hmsInstance.endRoom("Meeting concluded", true);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/end-room
   * @async
   * @function endRoom
   * @memberof HMSSDK
   */
  endRoom = async (reason: string, lock: boolean = false): Promise<void> => {
    logger?.verbose('#Function endRoom', { lock, reason, id: this.id });
    const data = {
      lock,
      reason,
      id: this.id,
    };

    return await HMSManager.endRoom(data);
  };

  /**
   * Asynchronously changes the name of the local peer.
   *
   * This function updates the name of the local peer in the room. It is useful for scenarios where a user's display name needs to be updated during a session, such as when a user decides to change their nickname or when correcting a typo in the user's name. The updated name is reflected across all participants in the room.
   *
   * Once the name change is successful, all the peers receive HMSUpdateListenerActions.ON_PEER_UPDATE event with HMSPeerUpdate.NAME_CHANGED as update type. When this event is received, the UI for that peer should be updated.
   *
   * @param {string} name - The new name to be set for the local peer.
   * @returns {Promise<void>} A promise that resolves when the name change operation has been successfully completed.
   * @throws {Error} Throws an error if the name change operation fails.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-name for more information on changing the peer's name.
   * @async
   * @function changeName
   * @memberof HMSSDK
   *
   * @example
   * // Change the name of the local peer to 'Alice'
   * await hmsInstance.changeName("Alice");
   */
  changeName = async (name: string): Promise<void> => {
    logger?.verbose('#Function changeName', { name, id: this.id });
    const data = {
      name,
      id: this.id,
    };

    return await HMSManager.changeName(data);
  };

  /**
   * Asynchronously previews the audio and video tracks for a specific role before applying the role change.
   *
   * This method allows users to preview the expected audio and video tracks that will be visible to other peers in the room
   * after changing their role. It is useful for scenarios where a user wants to understand the impact of a role change on their
   * media tracks before making the change. This can help in ensuring that the right media settings are applied for the new role.
   *
   * @param {string} role - The role for which the preview is requested. The role should be defined within the room's role configurations.
   * @returns {Promise<any>} A promise that resolves with the preview tracks information. The resolved object contains details about the audio and video tracks that would be available to the user if the role were changed to the specified role.
   *
   * @example
   * // Preview the tracks for the 'speaker' role
   * const previewTracks = await hmsInstance.previewForRole('speaker');
   * console.log(previewTracks);
   *
   * @async
   * @function previewForRole
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
   * Asynchronously cancels the preview for a role change.
   *
   * This method is intended to be used after a `previewForRole` invocation. It cancels the ongoing preview operation,
   * effectively clearing any tracks that were created in anticipation of a role change. This is useful in scenarios where
   * a role change preview was initiated but needs to be aborted before the actual role change occurs, allowing for clean
   * state management and resource cleanup.
   *
   * @async
   * @function cancelPreview
   * @memberof HMSSDK
   * @returns {Promise<{data: string}>} A promise that resolves with an object containing a data string.
   *
   * @example
   * // Cancel a previously initiated role change preview
   * await hmsInstance.cancelPreview();
   *
   */
  cancelPreview = async (): Promise<{ success: boolean }> => {
    logger?.verbose('#Function cancelPreview', {
      id: this.id,
    });
    const data = await HMSManager.cancelPreview({
      id: this.id,
    });

    return data;
  };

  /**
   * Asynchronously accepts a role change request for the local peer.
   *
   * This method is used when a role change request has been made to the local peer, typically by an admin or moderator of the room.
   * Invoking this method signals acceptance of the new role, and the role change is applied to the local peer. This can affect the peer's
   * permissions and capabilities within the room, such as the ability to send video, audio, or chat messages.
   *
   * The successful execution of this method triggers an update across the room, notifying other peers of the role change.
   * It is important to handle this method's response to ensure the local UI reflects the new role's permissions and capabilities.
   *
   * @async
   * @function acceptRoleChange
   * @memberof HMSSDK
   * @returns {Promise<void>} A promise that resolves when the role change has been successfully accepted and applied.
   * @throws {Error} Throws an error if the role change acceptance operation fails.
   * @example
   * // Accept a role change request to become a 'moderator'
   * await hmsInstance.acceptRoleChange();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role
   */
  acceptRoleChange = async (): Promise<void> => {
    logger?.verbose('#Function acceptRoleChange', { id: this.id });
    return await HMSManager.acceptRoleChange({ id: this.id });
  };

  /**
   * Sets the mute status for all remote audio tracks in the room for the local peer.
   *
   * This method allows the local user to mute or unmute the playback of all remote audio tracks in the room.
   * It affects only the local peer's audio playback and does not impact other peers. This can be useful in scenarios
   * where a user needs to quickly mute all incoming audio without affecting the audio state for other participants in the room.
   *
   * @param {boolean} mute - A boolean value indicating whether to mute (`true`) or unmute (`false`) all remote audio tracks for the local peer.
   * @returns {Promise<boolean>} A promise that resolves with a boolean value indicating the success of the operation.
   * @throws {Error} Throws an error if the operation fails.
   * @async
   * @function setPlaybackForAllAudio
   * @memberof HMSSDK
   * @example
   * // Mute all remote audio tracks for the local peer
   * hmsInstance.setPlaybackForAllAudio(true);
   *
   * @example
   * // Unmute all remote audio tracks for the local peer
   * hmsInstance.setPlaybackForAllAudio(false);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/playback-allowed
   */
  setPlaybackForAllAudio = async (mute: boolean): Promise<boolean> => {
    logger?.verbose('#Function setPlaybackForAllAudio', { mute, id: this.id });
    return await HMSManager.setPlaybackForAllAudio({ mute, id: this.id });
  };

  /**
   * Mutes the audio for all peers in the room.
   *
   * This asynchronous function communicates with the native `HMSManager` module to mute the audio tracks of all remote peers in the room.
   * It is particularly useful in scenarios where a moderator needs to quickly mute all participants to prevent background noise or interruptions during a session.
   *
   * @async
   * @function remoteMuteAllAudio
   * @memberof HMSSDK
   * @returns {Promise<{success: boolean}>} A promise that resolves with a boolean value indicating the success of the operation.
   * @throws {Error} Throws an error if the operation fails.
   * @example
   * // Mute all remote audio tracks in the room
   * await hmsInstance.remoteMuteAllAudio();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/remote-mute
   */
  remoteMuteAllAudio = async (): Promise<{ success: boolean }> => {
    logger?.verbose('#Function remoteMuteAllAudio', { id: this.id });
    return await HMSManager.remoteMuteAllAudio({ id: this.id });
  };

  /**
   * Retrieves the current room's details.
   *
   * This method acts as a wrapper around the native `getRoom` function, providing an easy way to obtain the current room's state and details,
   * including participants, tracks, and other relevant information. The room object is fetched from the native module and then processed
   * to match the expected format in the React Native layer. This method is useful for getting the room's state at any point in time, such as
   * when needing to display current room information or for debugging purposes.
   *
   * @async
   * @function getRoom
   * @memberof HMSSDK
   * @returns {Promise<HMSRoom>} A promise that resolves to the current room object.
   * @example
   * // Fetch the current room details
   * const roomDetails = await hmsInstance.getRoom();
   * console.log(roomDetails);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/get-methods
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
   * Retrieves the current local peer's details.
   *
   * This asynchronous method wraps around the native `getLocalPeer` function, providing a straightforward way to obtain the current local peer's details,
   * including their ID, name, role, and any tracks they may be publishing. The local peer object is fetched from the native module and then processed
   * to match the expected format in the React Native layer. This method is particularly useful for operations that require information about the local user,
   * such as updating UI elements to reflect the current user's status or for debugging purposes.
   *
   * @async
   * @function getLocalPeer
   * @memberof HMSSDK
   * @returns {Promise<HMSLocalPeer>} A promise that resolves to the current local peer object.
   * @example
   * // Fetch the current local peer's details
   * const localPeerDetails = await hmsInstance.getLocalPeer();
   * console.log(localPeerDetails);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/get-methods
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
   * Retrieves an array of remote peers currently in the room.
   *
   * This asynchronous method serves as a wrapper around the native `getRemotePeers` function, facilitating the retrieval of remote peers' details.
   * It fetches an array of `HMSRemotePeer` objects, each representing a remote participant in the room. The method processes the fetched data
   * to conform to the expected format in the React Native layer, making it suitable for UI rendering or further processing.
   *
   * @async
   * @function getRemotePeers
   * @memberof HMSSDK
   * @returns {Promise<HMSRemotePeer[]>} A promise that resolves with an array of `HMSRemotePeer` objects, representing the remote peers in the room.
   * @example
   * // Fetch the list of remote peers in the room
   * const remotePeers = await hmsInstance.getRemotePeers();
   * console.log(remotePeers);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/get-methods
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
   * Retrieves a list of all roles currently available in the room.
   *
   * This asynchronous method calls the native `getRoles` function to fetch an array of `HMSRole` objects, representing the roles defined for the room.
   * Each `HMSRole` object includes details such as the role name, permissions, and other role-specific settings. The roles are then processed
   * to match the expected format in the React Native layer. This method is useful for operations that require a comprehensive list of roles,
   * such as displaying role options in a UI dropdown for role assignment or for role-based access control checks.
   *
   * @async
   * @function getRoles
   * @memberof HMSSDK
   * @returns {Promise<HMSRole[]>} A promise that resolves with an array of `HMSRole` objects, representing the available roles in the room.
   *
   * @example
   * // Fetch the list of available roles in the room
   * const roles = await hmsInstance.getRoles();
   * console.log(roles);
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
   * Sets the volume for a specific track of any peer in the room.
   *
   * This function allows the adjustment of the playback volume for any given audio track of a peer within the room.
   * It is particularly useful for controlling the audio levels of individual participants in a conference call or meeting.
   * The volume level is specified as a number. Volume level can vary from 0(min) to 10(max). The default value for volume is 1.0.
   *
   * @param {HMSTrack} track - The track object whose volume is to be set. This object must include a valid `trackId`.
   * @param {number} volume - The volume level to set for the specified track.
   * @returns {Promise<void>} A promise that resolves when the operation to set the track's volume is complete.
   * @throws {Error} Throws an error if the operation fails or the track cannot be found.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/set-volume
   *
   * @async
   * @memberof HMSSDK
   *
   * @example
   * // Assuming `track` is an instance of HMSTrack representing the participant's audio track
   * hmsInstance.setVolume(track, 10);
   */
  setVolume = async (track: HMSTrack, volume: number): Promise<void> => {
    logger?.verbose('#Function setVolume', {
      track,
      volume,
      id: this.id,
    });
    return await HMSManager.setVolume({
      id: this.id,
      trackId: track.trackId,
      volume,
    });
  };

  /**
   * Initiates screen sharing in the room.
   *
   * This asynchronous function triggers the screen sharing feature, allowing the local peer to share their screen with other participants in the room.
   * Upon successful execution, other participants in the room will be able to see the shared screen as part of the video conference.
   *
   * Note: Proper permissions must be granted by the user for screen sharing to work. Ensure to handle permission requests appropriately in your application.
   *
   * @async
   * @function startScreenshare
   * @memberof HMSSDK
   * @returns {Promise<void>} A promise that resolves when the screen sharing has successfully started.
   * @throws {Error} Throws an error if the operation fails or screen sharing cannot be initiated.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/screenshare
   * @example
   * // Start screen sharing
   * await hmsInstance.startScreenshare();
   */
  startScreenshare = async () => {
    logger?.verbose('#Function startScreenshare', { id: this.id });
    return await HMSManager.startScreenshare({ id: this.id });
  };

  /**
   * Checks if the screen sharing is currently active in the room.
   *
   * This asynchronous method queries the native `HMSManager` module to determine if the screen is currently being shared by the local peer in the room.
   * It returns a promise that resolves to a boolean value, indicating the screen sharing status. `true` signifies that the screen sharing is active,
   * while `false` indicates that it is not. This method can be used to toggle UI elements or to decide whether to start or stop screen sharing based on the current state.
   *
   * @async
   * @function isScreenShared
   * @memberof HMSSDK
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the screen is currently shared.
   * @example
   * // Check if the screen is currently shared
   * const isShared = await hmsInstance.isScreenShared();
   * console.log(isShared ? "Screen is being shared" : "Screen is not being shared");
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/screenshare
   */
  isScreenShared = async (): Promise<boolean> => {
    logger?.verbose('#Function isScreenShared', { id: this.id });
    return await HMSManager.isScreenShared({ id: this.id });
  };

  /**
   * Asynchronously stops the screen sharing session.
   *
   * This method communicates with the native `HMSManager` module to stop the ongoing screen sharing session initiated by the local peer.
   * Upon successful execution, the screen sharing session is terminated, and other participants
   * in the room will no longer be able to see the shared screen. This method can be used to programmatically control the end of a screen sharing session,
   * providing flexibility in managing the screen sharing feature within your application.
   *
   * Note: Ensure that the necessary permissions and conditions for screen sharing are managed appropriately in your application.
   *
   * @async
   * @function stopScreenshare
   * @memberof HMSSDK
   * @returns {Promise<void>} A promise that resolves when the screen sharing has successfully stopped.
   * @throws {Error} Throws an error if the operation fails or the screen sharing cannot be stopped.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/screenshare
   * @example
   * // Stop screen sharing
   * await hmsInstance.stopScreenshare();
   */
  stopScreenshare = async () => {
    logger?.verbose('#Function stopScreenshare', { id: this.id });
    return await HMSManager.stopScreenshare({ id: this.id });
  };

  /**
   * Enables network quality updates for the local peer.
   *
   * This method activates the network quality monitoring feature, which periodically assesses and reports the network quality of peers in a room.
   * The network quality updates are useful for providing feedback to the user about their current connection status, potentially prompting them to improve their network environment if necessary.
   * Upon enabling, network quality updates are emitted through the appropriate event listeners - `HMSPeerUpdate.NETWORK_QUALITY_UPDATED` allowing the application to react or display the network status dynamically.
   *
   * @function enableNetworkQualityUpdates
   * @memberof HMSSDK
   * @example
   * // Enable network quality updates
   * hmsInstance.enableNetworkQualityUpdates();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/network-quality
   */
  enableNetworkQualityUpdates = () => {
    logger?.verbose('#Function enableNetworkQualityUpdates', { id: this.id });
    HMSManager.enableNetworkQualityUpdates({ id: this.id });
  };

  /**
   * Disables network quality updates for the local peer.
   *
   * This method deactivates the network quality monitoring feature, which stops the periodic assessment and reporting of the network quality of peers in a room.
   * Disabling network quality updates can be useful in scenarios where network quality information is no longer needed, or to reduce the computational overhead associated with monitoring network quality.
   * Once disabled, network quality updates will no longer be emitted through the event listeners, allowing the application to cease reacting to or displaying network status information.
   *
   * @function disableNetworkQualityUpdates
   * @memberof HMSSDK
   * @example
   * // Disable network quality updates
   * hmsInstance.disableNetworkQualityUpdates();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/network-quality
   */
  disableNetworkQualityUpdates = () => {
    logger?.verbose('#Function disableNetworkQualityUpdates', { id: this.id });
    HMSManager.disableNetworkQualityUpdates({ id: this.id });
  };

  /**
   * Starts streaming device audio, available only on Android devices.
   *
   * This method allows the application to share device audio, such as music or system sounds, with other participants in a video conference.
   * It leverages the native HMSManager's `startAudioshare` method to initiate audio sharing. The function takes an `HMSAudioMixingMode` parameter,
   * which specifies the audio mixing mode to be used during the audio share session.
   *
   * Note: This feature is currently supported only on Android. Attempting to use this feature on iOS will result in a console log indicating
   * that the API is not available for iOS.
   *
   * @async
   * @function startAudioshare
   * @param {HMSAudioMixingMode} audioMixingMode - The audio mixing mode to be used for the audio share session.
   * @returns {Promise} A promise that resolves to a success if the audio share is started successfully
   * @throws {Error} Throws an error if the operation fails or the audio share cannot be started.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   *
   * @example
   * // Start audio sharing with the default mixing mode
   * await hmsInstance.startAudioshare(HMSAudioMixingMode.DEFAULT);
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
   * Checks if audio sharing is currently active.
   *
   * This asynchronous method determines whether audio sharing is currently active, with support limited to Android devices.
   * On Android, it queries the native `HMSManager` module to check the audio sharing status and returns a promise that resolves to a boolean value.
   *
   * @async
   * @function isAudioShared
   * @memberof HMSSDK
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether audio sharing is currently active.
   * @example
   * // Check if audio is being shared on an Android device
   * const isSharing = await hmsInstance.isAudioShared();
   * console.log(isSharing); // true or false based on the sharing status, or a message for iOS
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   */
  isAudioShared = async (): Promise<boolean> => {
    logger?.verbose('#Function isAudioShared', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.isAudioShared({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return Promise.resolve(false);
    }
  };

  /**
   * Stops the streaming of device audio, with functionality currently limited to Android devices.
   *
   * This asynchronous method communicates with the native `HMSManager` module to stop the audio sharing session that was previously started.
   * It is primarily used when the application needs to cease sharing device audio, such as music or system sounds, with other participants in a video conference.
   * On Android devices, it successfully terminates the audio share session. On iOS devices, since the feature is not supported, it logs a message indicating the unavailability of the API.
   *
   * @async
   * @function stopAudioshare
   * @memberof HMSSDK
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the success of the operation.
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   *
   * @example
   * // Stop audio sharing
   * await hmsInstance.stopAudioshare();
   */
  stopAudioshare = async (): Promise<boolean> => {
    logger?.verbose('#Function stopAudioshare', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.stopAudioshare({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return Promise.resolve(false);
    }
  };

  /**
   * Asynchronously retrieves the current audio mixing mode, with functionality currently limited to Android devices.
   *
   * This method queries the native `HMSManager` module to obtain the current audio mixing mode used in the audio share session.
   * The audio mixing mode determines how local and remote audio tracks are mixed together during an audio share session.
   *
   * Note: This feature is only supported on Android. Attempting to use this feature on iOS will result in a console log indicating
   * that the API is not available for iOS devices.
   *
   * @async
   * @function getAudioMixingMode
   * @memberof HMSSDK
   * @returns {Promise<string>} A promise that resolves to a string indicating the current audio mixing mode.
   *
   * @throws {Error} Throws an error if the operation fails or the audio mixing mode cannot be retrieved.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   * @example
   * // Get the current audio mixing mode on an Android device
   * const mixingMode = await hmsInstance.getAudioMixingMode();
   * console.log(mixingMode); // Outputs the current audio mixing mode or a message for iOS
   */
  getAudioMixingMode = async (): Promise<string> => {
    logger?.verbose('#Function getAudioMixingMode', { id: this.id });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioMixingMode({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return Promise.reject('API currently not available for iOS');
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
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the success of the operation.
   * @throws {Error} Throws an error if the operation fails or the audio mixing mode cannot be set.
   *
   * @example
   * await hmsInstance.setAudioMixingMode(HMSAudioMixingMode.TALK_AND_MUSIC);
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/local-audio-share
   *
   * @memberof HMSSDK
   */
  setAudioMixingMode = async (
    audioMixingMode: HMSAudioMixingMode
  ): Promise<boolean> => {
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
      return Promise.reject('API currently not available for iOS');
    }
  };

  /**
   * Retrieves a list of audio output devices. Android only.
   *
   * This method asynchronously fetches and returns an array of audio output devices available on the device.
   * It is designed to work specifically on Android platforms. For iOS, it will reject the promise with a message
   * indicating that the API is not available. This can be useful for applications that need to display or allow
   * the user to select from available audio output options, such as speakers, headphones, or Bluetooth devices.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/speaker/audio-output-routing
   *
   * @memberof HMSSDK
   * @returns {Promise<HMSAudioDevice[]>} A promise that resolves to an array of `HMSAudioDevice` objects on Android. On iOS, the promise is rejected.
   * @example
   * // Get the list of audio output devices
   * const audioDevices = await hmsInstance.getAudioDevicesList();
   */
  getAudioDevicesList = async (): Promise<HMSAudioDevice[]> => {
    logger?.verbose('#Function getAudioDevicesList', {
      id: this.id,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioDevicesList({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return Promise.reject('API currently not available for iOS');
    }
  };

  /**
   * Retrieves the current audio output device type on Android devices.
   *
   * This method is a wrapper function that returns the type of the current audio output device.
   * The return type is a `HMSAudioDevice`, which is an enumeration representing different types of audio output devices.
   *
   * Note: This API is not available for iOS devices. If invoked on iOS, it logs a message indicating the unavailability and rejects the promise.
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/speaker/audio-output-routing
   *
   * @memberof HMSSDK
   * @returns {Promise<HMSAudioDevice>} A promise that resolves to the current audio output device type if the platform is Android. If the platform is iOS, the promise is rejected.
   *
   * @example
   * // Get the current audio output device type
   * const currentAudioOutputDevice = await hmsInstance.getAudioOutputRouteType();
   */
  getAudioOutputRouteType = async (): Promise<HMSAudioDevice> => {
    logger?.verbose('#Function getAudioOutputRouteType', {
      id: this.id,
    });
    if (Platform.OS === 'android') {
      return await HMSManager.getAudioOutputRouteType({ id: this.id });
    } else {
      console.log('API currently not available for iOS');
      return Promise.reject('API currently not available for iOS');
    }
  };

  /**
   * Switches the audio output device to a specified device.
   * This function is a wrapper around the native module's method to change the audio output route.
   * It allows for changing the audio output to a device other than the default one, such as a Bluetooth headset or speaker.
   *
   * @param {HMSAudioDevice} audioDevice - The audio device to switch the output to. This should be one of the devices available in `HMSAudioDevice`.
   *
   * @returns {Promise<void>} A promise that resolves when the audio output device is successfully switched. Rejected if the operation fails.
   *
   *  @example
   * // To switch audio output to a Bluetooth device
   * hmsSDK.switchAudioOutput(HMSAudioDevice.Bluetooth);
   *
   * @memberof HMSSDK
   */
  switchAudioOutput = (audioDevice: HMSAudioDevice): Promise<void> => {
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
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/speaker/audio-mode-change
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
   * Adds a listener for changes in the audio output device.
   * This function is platform-specific and currently only implemented for Android devices.
   * When the audio output device changes (e.g., switching from the phone speaker to a Bluetooth headset), the specified callback function is triggered.
   * This can be useful for applications that need to react to changes in audio routing, such as updating the UI to reflect the current output device.
   *
   * Note: This API is not available on iOS as of the current implementation. Attempting to use it on iOS will result in a rejected promise with an appropriate error message.
   *
   * @param {Function} callback - The function to be called when the audio output device changes. This function does not receive any parameters.
   * @memberof HMSSDK
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/speaker/audio-output-routing
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
      return Promise.reject('API currently not available for iOS');
    }
  };

  /**
   * Asynchronously retrieves a remote video track by its track ID.
   *
   * @param {string} trackId - The unique identifier for the remote video track to be retrieved.
   * @returns {Promise<HMSRemoteVideoTrack>} A promise that resolves to the encoded remote video track data.
   */
  getRemoteVideoTrackFromTrackId = async (
    trackId: string
  ): Promise<HMSRemoteVideoTrack> => {
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

  /**
   * Retrieves a remote audio track by its track ID.
   *
   * @param {string} trackId - The unique identifier for the remote audio track to be retrieved.
   * @returns {Promise<HMSRemoteAudioTrack>} A promise that resolves to the encoded remote audio track data.
   */
  getRemoteAudioTrackFromTrackId = async (
    trackId: string
  ): Promise<HMSRemoteAudioTrack> => {
    // Log the function call with the track ID for debugging purposes.
    logger?.verbose('#Function getRemoteAudioTrackFromTrackId', {
      id: this.id,
      trackId,
    });

    // Fetch the remote audio track data from the native HMSManager.
    const remoteAudioTrackData =
      await HMSManager.getRemoteAudioTrackFromTrackId({
        id: this.id,
        trackId,
      });
    // Encode and return the remote audio track data.
    return HMSEncoder.encodeHmsRemoteAudioTrack(remoteAudioTrackData, this.id);
  };

  /**
   * Retrieves a peer object based on the provided peer ID.
   *
   * @param {string} peerId - The ID of the peer to retrieve.
   * @returns {HMSPeer | undefined} An encoded HMSPeer object if the peer is found otherwise `undefined`.
   */
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

  setPermissionsAcceptedOnAndroid = async () => {
    if (Platform.OS === 'ios') {
      Promise.reject(
        'setPermissionsAcceptedOnAndroid API not available for iOS'
      );
      return;
    }
    logger?.verbose('#Function setPermissionsAcceptedOnAndroid', {
      id: this.id,
    });
    return await HMSManager.setPermissionsAccepted({ id: this.id });
  };

  /**
   * Registers an event listener for various HMS SDK events.
   *
   * This method allows the registration of callbacks for different types of events that can occur within the HMS SDK.
   * These events include but are not limited to updates about the room, peers, tracks, and errors.
   * The method dynamically adds listeners based on the specified action and associates them with a callback function
   * to handle the event. It ensures that only one subscription exists per event type to avoid duplicate listeners.
   *
   * @param {HMSUpdateListenerActions | HMSPIPListenerActions} action - The specific action/event to listen for.
   * @param {Function} callback - The callback function to execute when the event occurs. The specifics of the callback parameters depend on the event type.
   * @memberof HMSSDK
   *
   * @example
   * hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, (event) => {
   *   console.log('Joined the room:', event);
   * });
   *
   * @example
   * hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, (event) => {
   *   console.log('Peer update:', event);
   * });
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
      case HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED: {
        // Checking if we already have ON_PERMISSIONS_REQUESTED subscription
        if (
          !this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED
          ]
        ) {
          // Adding ON_PERMISSIONS_REQUESTED native listener
          const permissionsRequestedSubscription =
            HMSNativeEventListener.addListener(
              this.id,
              HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED,
              this.onPermissionsRequestedListener
            );
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED
          ] = permissionsRequestedSubscription;
        }
        // Adding App Delegate listener
        this.onPermissionsRequestedDelegate = callback;
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
   * Removes an event listener for a specified event action.
   *
   * This method allows for the deregistration of previously registered callbacks for specific event types within the HMS SDK.
   * By specifying the action and the callback, it ensures that the event listener associated with that action is removed,
   * preventing the callback from being executed when the event occurs in the future. This is useful for cleaning up resources
   * and avoiding potential memory leaks in applications that dynamically add and remove event listeners based on component lifecycle
   * or user interactions.
   *
   * @param {HMSUpdateListenerActions | HMSPIPListenerActions} action - The specific action/event for which the listener is to be removed.
   * @param {Function} callback - The callback function that was originally registered for the event. This parameter is necessary to ensure
   *                              that only the specific callback associated with the action is removed.
   * @memberof HMSSDK
   * @example
   * // Remove a listener for the ON_JOIN event
   * hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinCallback);
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
      case HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED: {
        const subscription =
          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED
          ];
        // Removing ON_PERMISSIONS_REQUESTED native listener
        if (subscription) {
          subscription.remove();

          this.emitterSubscriptions[
            HMSUpdateListenerActions.ON_PERMISSIONS_REQUESTED
          ] = undefined;
        }
        // Removing App Delegate listener
        this.onPermissionsRequestedDelegate = null;
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

  onPermissionsRequestedListener = (data: {
    id: string;
    permissions: Array<string>;
  }) => {
    if (data.id !== this.id) {
      return;
    }
    if (this.onPermissionsRequestedDelegate) {
      logger?.verbose('#Listener ON_PERMISSIONS_REQUESTED_LISTENER_CALL', data);
      this.onPermissionsRequestedDelegate({ ...data });
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
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
   *
   *  @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
   * @async
   * @function changeIOSPIPVideoTrack
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
   * @memberof HMSSDK
   * @example
   * // Example of changing the video track for PIP mode on iOS
   * hms.changeIOSPIPVideoTrack(videoTrack).then(() => {
   *   console.log('Video track for PIP mode changed successfully');
   * }).catch(error => {
   *   console.error('Failed to change video track for PIP mode', error);
   * });
   *
   */
  async changeIOSPIPVideoTrack(track: HMSVideoTrack) {
    if (Platform.OS === 'ios') {
      const data = {
        id: this.id,
        trackId: track.trackId,
      };
      logger?.verbose('#Function changeIOSPIPVideoTrack', data);
      return await HMSManager.changeIOSPIPVideoTrack(data);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * - This function is used to automatically switch the video track of the active speaker to the Picture in Picture (PIP) mode window on iOS devices.
   * - When enabled, the video track of the active speaker will be displayed in the PIP mode window, providing a focused view of the current speaker during a meeting or conference.
   * @param {boolean} enable - A boolean value indicating whether to enable or disable the automatic switching of the active speaker video track in PIP mode.
   * @returns {Promise} - A promise that resolves when the operation is successful, or rejects with an error if the operation fails.
   * @throws {Error} - Throws an error if the operation fails.
   * @async
   * @function setActiveSpeakerInIOSPIP
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/pip-mode
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
    if (Platform.OS === 'ios') {
      const data = {
        id: this.id,
        enable,
      };
      logger?.verbose('#Function setActiveSpeakerInIOSPIP', data);
      return await HMSManager.setActiveSpeakerInIOSPIP(data);
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * Initiates real-time transcription services.
   *
   * This asynchronous function triggers the HMSManager to start real-time transcription services,
   * capturing and transcribing audio in real time.
   *
   * @async
   * @function startRealTimeTranscription
   * @memberof HMSSDK
   * @example
   * // Example of starting real-time transcription services
   * await hmsInstance.startRealTimeTranscription();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/extend-capabilities/live-captions
   */
  async startRealTimeTranscription() {
    const data = {
      id: this.id,
      action: 'start',
    };
    logger?.verbose('#Function startRealTimeTranscription', data);
    return HMSManager.handleRealTimeTranscription(data);
  }

  /**
   * Stops the real-time transcription services.
   *
   * This asynchronous function signals the HMSManager to terminate the ongoing real-time transcription services.
   *
   * @async
   * @function stopRealTimeTranscription
   * @memberof HMSSDK
   * @example
   * await hmsInstance.stopRealTimeTranscription();
   *
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/extend-capabilities/live-captions
   */
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
   * Retrieves the current logger instance used by the HMSSDK.
   *
   * This static method provides access to the logger instance, allowing for the manipulation of log levels and the retrieval of log information. It is useful for debugging purposes, enabling developers to monitor and adjust the verbosity of logs generated by the HMS SDK.
   *
   * @returns {HMSLogger} The current logger instance.
   * @memberof HMSSDK
   * @example
   * const logger = HMSSDK.getLogger();
   * logger.setLevel('debug'); // Adjusting the log level to debug
   */
  static getLogger() {
    return getLogger();
  }

  /**
   * Updates the logger instance for this HMSSDK instance.
   *
   * This method allows for the dynamic updating of the logger instance used by the HMSSDK.
   * It can be used to change the logger settings or replace the logger entirely at runtime.
   * This is particularly useful for adjusting log levels or redirecting log output based on application state or user preferences.
   *
   * @param {HMSLogger} hmsLogger - The new logger instance to be used. If not provided, the logger will be reset to default.
   * @memberof HMSSDK
   * @example
   * // Set a custom logger with a specific configuration
   * const customLogger = new HMSLogger();
   * customLogger.setLevel('verbose');
   * hmsInstance.setLogger(customLogger);
   *
   */
  setLogger = (hmsLogger?: HMSLogger) => {
    setLogger(this.id, hmsLogger);
  };
}
