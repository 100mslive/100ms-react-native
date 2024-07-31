/**
 * Enum for camera facing directions in a 100ms (HMS) application.
 *
 * This enumeration defines the possible camera facing options for video tracks in a 100ms (HMS) application, allowing developers to specify whether the front or back camera should be used during a video session.
 * This can be particularly useful for applications that need to switch between cameras or provide users with the option to choose their preferred camera.
 *
 * @enum {string}
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/mute#switch-camera
 */
export enum HMSCameraFacing {
  /** Represents the front camera on a device. */
  FRONT = 'FRONT',
  /** Represents the back camera on a device. */
  BACK = 'BACK',
}
