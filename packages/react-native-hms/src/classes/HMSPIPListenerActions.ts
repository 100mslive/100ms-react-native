/**
 * Enum for HMS Picture-in-Picture (PIP) Listener Actions.
 *
 * This enum defines the types of actions/events related to the Picture-in-Picture (PIP) mode that can be listened to
 * within the HMS SDK. These actions allow the application to respond to changes in PIP mode or when the room is left
 * while in PIP mode.
 *
 * @enum {string}
 */
export enum HMSPIPListenerActions {
  /**
   * Action triggered when the Picture-in-Picture mode changes.
   * This can be used to handle UI changes or other logic when entering or exiting PIP mode.
   */
  ON_PIP_MODE_CHANGED = 'ON_PIP_MODE_CHANGED',

  /**
   * Action triggered when the room is left while in Picture-in-Picture mode. Android only.
   * This can be used to clean up resources or update the UI accordingly.
   */
  ON_PIP_ROOM_LEAVE = 'ON_PIP_ROOM_LEAVE',
}
