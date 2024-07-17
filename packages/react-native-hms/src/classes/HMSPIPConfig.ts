import type { HMSVideoViewMode } from './HMSVideoViewMode';

/**
 * Configuration options for Picture-in-Picture (PIP) mode in a React Native application using HMS.
 *
 * This interface defines the settings available for customizing the PIP window that can appear when the app enters background mode.
 * It includes options for automatically entering PIP mode, adjusting the aspect ratio and scale type of the PIP window, and toggling
 * the visibility of various control buttons specific to Android or iOS platforms.
 *
 * @interface HMSPIPConfig
 * @property {boolean} [autoEnterPipMode] - Determines whether the app should automatically enter PIP mode when it goes into the background.
 * @property {[number, number]} [aspectRatio] - Sets the aspect ratio of the PIP window. Defaults are platform-specific: [16, 9] for Android and [9, 16] for iOS.
 * @property {HMSVideoViewMode} [scaleType] - Defines the scaling behavior of the video within the PIP window. Options are `ASPECT_FILL` (default), `ASPECT_FIT`, and `ASPECT_BALANCED`. Applies only to iOS.
 * @property {boolean} [useActiveSpeaker] - Whether the PIP window should automatically show the active speaker. Default is true. Applies only to iOS.
 * @property {boolean} [endButton] - Controls the visibility of the end call button within the PIP window. Default is true. Applies only to Android.
 * @property {boolean} [audioButton] - Controls the visibility of the audio mute/unmute button within the PIP window. Default is true. Applies only to Android.
 * @property {boolean} [videoButton] - Controls the visibility of the video mute/unmute button within the PIP window. Default is true. Applies only to Android.
 */
export interface HMSPIPConfig {
  /**
   * Whether to automatically enter PIP mode when app enters background.
   */
  autoEnterPipMode?: boolean;

  /**
   * The aspect ratio of the PIP window. Default is [16, 9] on Android & [9, 16] on iOS. Other values can be [3, 4], [1, 1], [4, 3], [16, 9].
   */
  aspectRatio?: [number, number];

  /**
   * The scale type of the PIP window. Default is ASPECT_FILL. Other values can be ASPECT_FIT, ASPECT_BALANCED. iOS Only.
   */
  scaleType?: HMSVideoViewMode;

  /**
   * Whether to show the Active Speaker in the PIP window. Default is true. iOS only.
   */
  useActiveSpeaker?: boolean;

  /**
   * Whether to show the end button in the PIP window. Default is true. Android only.
   */
  endButton?: boolean;

  /**
   * Whether to show the audio mute/unmute button in the PIP window. Default is true. Android only.
   */
  audioButton?: boolean;

  /**
   * Whether to show the video mute/unmute button in the PIP window. Default is true. Android only.
   */
  videoButton?: boolean;
}
