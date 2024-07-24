/**
 * Enum for HMSUpdateListenerActions.
 *
 * This enumeration defines the set of possible events that can be emitted by the HMSSDK during a Session.
 * These events cover a wide range of actions, from joining a room to receiving updates about peers and tracks, and more.
 * For more info about these events, checkout Event Listener docs
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/event-listeners
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { HMSUpdateListenerActions } from 'react-native-hms';
 * hmsinstance.on(HMSUpdateListenerActions.ON_JOIN, ({ room: HMSRoom }}) => {
 *  console.log('Joined room', data);
 *  // Handle the event
 * });
 * ```
 *
 * @property {string} ON_PREVIEW - Emitted when the local preview is available.
 * @property {string} ON_JOIN - Emitted when the local user joins the room.
 * @property {string} ON_ROOM_UPDATE - Emitted when there is an update related to the room.
 * @property {string} ON_PEER_UPDATE - Emitted when there is an update related to a peer in the room.
 * @property {string} ON_TRACK_UPDATE - Emitted when there is an update related to a track in the room.
 * @property {string} ON_ERROR - Emitted when an error occurs.
 * @property {string} ON_MESSAGE - Emitted when a message is received.
 * @property {string} ON_SPEAKER - Emitted when there is an update on the current speaker.
 * @property {string} RECONNECTING - Emitted when the SDK is attempting to reconnect to the room.
 * @property {string} RECONNECTED - Emitted when the SDK has successfully reconnected to the room.
 * @property {string} ON_ROLE_CHANGE_REQUEST - Emitted when there is a request to change the role of a peer.
 * @property {string} ON_CHANGE_TRACK_STATE_REQUEST - Emitted when there is a request to change the state of a track.
 * @property {string} ON_REMOVED_FROM_ROOM - Emitted when the local user is removed from the room.
 * @property {string} ON_RTC_STATS - Emitted when RTC stats are available.
 * @property {string} ON_LOCAL_AUDIO_STATS - Emitted when stats for the local audio track are available.
 * @property {string} ON_LOCAL_VIDEO_STATS - Emitted when stats for the local video track are available.
 * @property {string} ON_REMOTE_AUDIO_STATS - Emitted when stats for a remote audio track are available.
 * @property {string} ON_REMOTE_VIDEO_STATS - Emitted when stats for a remote video track are available.
 * @property {string} ON_AUDIO_DEVICE_CHANGED - Emitted when the audio device has changed.
 * @property {string} ON_SESSION_STORE_AVAILABLE - Emitted when the session store is available.
 * @property {string} ON_SESSION_STORE_CHANGED - Emitted when the session store has changed.
 * @property {string} ON_PEER_LIST_UPDATED - Emitted when the list of peers is updated.
 * @property {string} ON_TRANSCRIPTS - Emitted when transcripts are available.
 * @property {string} ON_PERMISSIONS_REQUESTED - Emitted when permissions are requested.
 */
export enum HMSUpdateListenerActions {
  /**
   * Event emitted when the local preview is available.
   *
   * This event is triggered once the local user's video preview becomes available.
   * It allows the application to display the local video stream to the user,
   * ensuring they can see their own feed before interacting with others in the room.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/preview
   */
  ON_PREVIEW = 'ON_PREVIEW',

  /**
   * Event emitted when the local user joins the room.
   *
   * This event signifies that the local user has successfully connected to the room and is now part of the session.
   * It is a critical event for initiating further actions within the room, such as fetching current participants,
   * subscribing to tracks, or sending messages. Handling this event properly is essential for setting up the user's
   * environment and ensuring a smooth experience in the room.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/join
   */
  ON_JOIN = 'ON_JOIN',

  /**
   * Event emitted when there is an update related to the room.
   *
   * This event is triggered by various room-related changes, such as updates to the room's metadata, changes in the room's state,
   * or modifications to the list of available tracks. It serves as a general notification to the application that some aspect of the
   * room's configuration or status has changed, enabling the application to respond appropriately, such as updating the UI or querying
   * for new information to reflect the current state of the room.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/event-listeners
   */
  ON_ROOM_UPDATE = 'ON_ROOM_UPDATE',

  /**
   * Event emitted when there is an update related to a peer in the room.
   *
   * This event is triggered whenever a peer's state changes within the room, such as when a peer's video or audio track is enabled or disabled,
   * or when a peer's metadata is updated. It provides a way for the application to react to changes in a peer's status, ensuring that the UI
   * and application state can be updated to reflect the current state of peers in the room.
   *
   * @type {string}
   * @see  https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/event-listeners
   */
  ON_PEER_UPDATE = '3',

  /**
   * Event emitted when the list of peers in the room is updated.
   *
   * This event is triggered whenever there is a change in the list of peers present in the room, such as when a new peer joins,
   * an existing peer leaves. It allows the application to react to changes in the room's
   * participant list, enabling dynamic updates to the UI or other logic based on the current set of participants.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/large-room
   */
  ON_PEER_LIST_UPDATED = 'ON_PEER_LIST_UPDATED',

  /**
   * Event emitted when there is an update related to a track in the room.
   *
   * This event is triggered whenever a track's state changes within the room, such as when a video or audio track is enabled or disabled,
   * or when a track's settings are modified. It provides a way for the application to react to changes in a track's status, ensuring that
   * the UI and application state can be updated to reflect the current state of tracks in the room.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/event-listeners
   */
  ON_TRACK_UPDATE = 'ON_TRACK_UPDATE',

  /**
   * Event emitted when an error occurs.
   *
   * This event is triggered whenever the HMS SDK encounters an error during its operation. It could be due to network issues,
   * permissions being denied, or any other error that prevents the SDK from functioning as expected. Handling this event allows
   * the application to inform the user about the issue and possibly take corrective action or log the error for further analysis.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/debugging/error-handling
   */
  ON_ERROR = 'ON_ERROR',

  /**
   * Event emitted when a message is received.
   *
   * This event is triggered whenever a message is sent by a peer in the room and received by the local user.
   * It is crucial for enabling real-time communication within the room, allowing participants to exchange text messages,
   * notifications, or commands. Handling this event is essential for applications that support chat or command-based interactions
   * among participants.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/chat
   */
  ON_MESSAGE = 'ON_MESSAGE',

  /**
   * Event emitted when there is an update on the current speaker.
   *
   * This event is triggered whenever the active speaker in the room changes, such as when a new participant starts speaking or the current speaker stops.
   * It allows the application to highlight the current speaker in the UI, enhancing the user experience by making it easier to follow the conversation flow.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/show-audio-level
   */
  ON_SPEAKER = 'ON_SPEAKER',

  /**
   * Event emitted when the SDK is attempting to reconnect to the room.
   *
   * This event is triggered when the connection to the room is lost, and the HMS SDK is trying to re-establish the connection.
   * It indicates that the SDK is in the process of reconnecting, allowing the application to notify users about the reconnection attempt
   * and possibly display a loading or waiting indicator. Handling this event is crucial for maintaining a smooth user experience during
   * network interruptions.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/handle-interruptions/reconnection-handling
   */
  RECONNECTING = 'RECONNECTING',

  /**
   * Event emitted when the SDK has successfully reconnected to the room.
   *
   * This event signifies that after a disconnection, the HMS SDK has managed to re-establish the connection to the room successfully.
   * It is crucial for applications to handle this event to update the UI and inform the user that the connection has been restored,
   * ensuring a seamless experience. This event can trigger re-initialization of room-related functionalities or refreshes of the UI
   * to reflect the current state of the room.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/handle-interruptions/reconnection-handling
   */
  RECONNECTED = 'RECONNECTED',

  /**
   * Event emitted when there is a request to change the role of a peer.
   *
   * This event is triggered whenever a request is made to change the role of a participant in the room, such as from a viewer to a speaker or vice versa.
   * Handling this event allows the application to manage user roles dynamically, ensuring that participants have the correct permissions for their intended
   * actions within the room. It is crucial for applications that implement role-based access control or need to change user permissions on the fly.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/peer/change-role
   */
  ON_ROLE_CHANGE_REQUEST = 'ON_ROLE_CHANGE_REQUEST',

  /**
   * Event emitted when there is a request to change the state of a track.
   *
   * This event is triggered whenever a request is made to change the state of a track within the room, such as enabling or disabling a video or audio track.
   * Handling this event allows the application to respond to changes in track states, ensuring that participants can control their audio and video streams
   * as needed. It is crucial for applications that allow users to manage their media streams dynamically during a session.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/remote-mute
   */
  ON_CHANGE_TRACK_STATE_REQUEST = 'ON_CHANGE_TRACK_STATE_REQUEST',

  /**
   * Event emitted when the local user is removed from the room.
   *
   * This event is triggered whenever the local user is explicitly removed from the room by an action from another participant with sufficient permissions or due to room policy violations. Handling this event is crucial for applications to gracefully disconnect the user from the session, possibly clear user-related data, and inform the user about the removal reason if applicable.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/end-room
   */
  ON_REMOVED_FROM_ROOM = 'ON_REMOVED_FROM_ROOM',

  /**
   * Event emitted when RTC stats are available.
   *
   * This event is triggered when real-time communication (RTC) statistics become available from the HMS SDK.
   * RTC stats provide detailed information about the performance and quality of the media streams in the session,
   * including metrics such as packet loss, jitter, round-trip time (RTT), and more. Handling this event allows
   * the application to monitor and react to the quality of the connection, potentially informing users about
   * the current call quality or troubleshooting issues in real-time.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/rtc-stats
   */
  ON_RTC_STATS = 'ON_RTC_STATS',

  /**
   * Event emitted when stats for the local audio track are available.
   *
   * This event is triggered when statistics related to the local user's audio track become available from the HMS SDK.
   * These statistics can include metrics such as round trip time, bitrate, and bytesSent, which are crucial for monitoring
   * the quality of the audio being transmitted. Handling this event allows the application to react to the audio quality,
   * potentially adjusting settings or notifying the user about issues in real-time.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/rtc-stats
   */
  ON_LOCAL_AUDIO_STATS = 'ON_LOCAL_AUDIO_STATS',

  /**
   * Event emitted when stats for the local video track are available.
   *
   * This event is triggered when statistics related to the local user's video track become available from the HMS SDK.
   * These statistics can include metrics such as frame rate, resolution, and bitrate, which are crucial for monitoring
   * the quality of the video being transmitted. Handling this event allows the application to react to the video quality,
   * potentially adjusting settings or notifying the user about issues in real-time.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/rtc-stats
   */
  ON_LOCAL_VIDEO_STATS = 'ON_LOCAL_VIDEO_STATS',

  /**
   * Event emitted when statistics for a remote audio track are available.
   *
   * This event is triggered when statistics related to an audio track from a remote user become available from the HMS SDK.
   * These statistics can include metrics such as bitrate, packet loss, and jitter, which are crucial for monitoring
   * the quality of the audio being received. Handling this event allows the application to react to the audio quality,
   * potentially adjusting settings or notifying the user about issues in real-time.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/rtc-stats
   */
  ON_REMOTE_AUDIO_STATS = 'ON_REMOTE_AUDIO_STATS',

  /**
   * Event emitted when statistics for a remote video track are available.
   *
   * This event is triggered when statistics related to a video track from a remote user become available from the HMS SDK.
   * These statistics can include metrics such as frame rate, resolution, bitrate, and packet loss, which are crucial for monitoring
   * the quality of the video being received. Handling this event allows the application to react to the video quality,
   * potentially adjusting settings or notifying the user about issues in real-time.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/measure-network-quality-and-performance/rtc-stats
   */
  ON_REMOTE_VIDEO_STATS = 'ON_REMOTE_VIDEO_STATS',

  /**
   * Event emitted when the audio device has changed. Android only.
   *
   * This event is triggered whenever there is a change in the audio output device, such as switching from the built-in speaker to a Bluetooth headset.
   * Handling this event allows the application to update any UI elements or settings related to the current audio device, ensuring that the user is always aware of which device is being used for audio output.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/speaker/audio-output-routing
   */
  ON_AUDIO_DEVICE_CHANGED = 'ON_AUDIO_DEVICE_CHANGED',

  /**
   * Event emitted when the session store becomes available.
   *
   * This event is triggered when the session store, which may contain critical data for the ongoing session such as user tokens, room state, or other metadata, becomes available to the application.
   * Handling this event allows the application to perform actions that depend on session-specific data, such as initializing user interfaces or fetching additional room details.
   * It is crucial for applications that need to ensure all necessary data is loaded before proceeding with further operations.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/session-store
   */
  ON_SESSION_STORE_AVAILABLE = 'ON_SESSION_STORE_AVAILABLE',

  /**
   * Event emitted when the session store has changed.
   *
   * This event is triggered whenever there is a change in the session store, which may include updates to user tokens, room state, or other metadata critical for the ongoing session.
   * Handling this event allows the application to react to changes in session-specific data in real-time, ensuring that the application's state is always synchronized with the session store.
   * This is crucial for applications that rely on up-to-date session information for functionalities like UI updates, access control, and room management.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/session-store
   */
  ON_SESSION_STORE_CHANGED = 'ON_SESSION_STORE_CHANGED',

  /**
   * Event emitted when transcripts are available.
   *
   * This event is triggered when the HMS SDK has generated transcripts from the audio streams in the room.
   * It allows the application to receive real-time or post-processed text versions of spoken content, which can be used for
   * accessibility features, content analysis, or storing meeting minutes. The availability of this feature depends on the
   * HMS service configuration and may require additional setup or permissions.
   *
   * @type {string}
   * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/extend-capabilities/live-captions
   */
  ON_TRANSCRIPTS = 'ON_TRANSCRIPTS',

  /**
   * Event emitted when the HMS SDK requests permissions from the user. Android only.
   *
   * This event is triggered whenever the application needs to request permissions from the user, such as access to the camera or microphone.
   * It is used in conjunction with the platform's permissions API to prompt the user for the necessary permissions and to inform the HMS SDK
   * of the user's response. This is crucial for features that require explicit user consent before they can be used.
   *
   * @type {string}
   */
  ON_PERMISSIONS_REQUESTED = 'ON_PERMISSIONS_REQUESTED',
}
