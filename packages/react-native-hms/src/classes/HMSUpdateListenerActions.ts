/**
 * Enum for HMSUpdateListenerActions.
 *
 * This enumeration defines the set of possible events that can be emitted by the HMSSDK during a Session.
 * These events cover a wide range of actions, from joining a room to receiving updates about peers and tracks, and more.
 * For more info about these events, checkout Event Listener docs
 * {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/listen-to-room-updates/event-listeners}
 *
 * @enum {string}
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
 *
 */
export enum HMSUpdateListenerActions {
  ON_PREVIEW = 'ON_PREVIEW',
  ON_JOIN = 'ON_JOIN',
  ON_ROOM_UPDATE = 'ON_ROOM_UPDATE',
  ON_PEER_UPDATE = '3',
  ON_TRACK_UPDATE = 'ON_TRACK_UPDATE',
  ON_ERROR = 'ON_ERROR',
  ON_MESSAGE = 'ON_MESSAGE',
  ON_SPEAKER = 'ON_SPEAKER',
  RECONNECTING = 'RECONNECTING',
  RECONNECTED = 'RECONNECTED',
  ON_ROLE_CHANGE_REQUEST = 'ON_ROLE_CHANGE_REQUEST',
  ON_CHANGE_TRACK_STATE_REQUEST = 'ON_CHANGE_TRACK_STATE_REQUEST',
  ON_REMOVED_FROM_ROOM = 'ON_REMOVED_FROM_ROOM',
  ON_RTC_STATS = 'ON_RTC_STATS',
  ON_LOCAL_AUDIO_STATS = 'ON_LOCAL_AUDIO_STATS',
  ON_LOCAL_VIDEO_STATS = 'ON_LOCAL_VIDEO_STATS',
  ON_REMOTE_AUDIO_STATS = 'ON_REMOTE_AUDIO_STATS',
  ON_REMOTE_VIDEO_STATS = 'ON_REMOTE_VIDEO_STATS',
  ON_AUDIO_DEVICE_CHANGED = 'ON_AUDIO_DEVICE_CHANGED',
  ON_SESSION_STORE_AVAILABLE = 'ON_SESSION_STORE_AVAILABLE',
  ON_SESSION_STORE_CHANGED = 'ON_SESSION_STORE_CHANGED',
  ON_PEER_LIST_UPDATED = 'ON_PEER_LIST_UPDATED',
  ON_TRANSCRIPTS = 'ON_TRANSCRIPTS',
}
