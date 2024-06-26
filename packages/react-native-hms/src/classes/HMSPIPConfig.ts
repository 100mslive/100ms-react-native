import type { HMSVideoViewMode } from './HMSVideoViewMode';

export interface HMSPIPConfig {
  /*
   * Whether to automatically enter PIP mode when app enters background.
   */
  autoEnterPipMode?: boolean;

  /*
   * The aspect ratio of the PIP window. Default is [9, 16]. Other values can be [3, 4], [1, 1], [4, 3], [16, 9].
   */
  aspectRatio?: number[];

  /*
   * The scale type of the PIP window. Default is ASPECT_FILL. Other values can be ASPECT_FIT, ASPECT_BALANCED. iOS Only.
   */
  scaleType: HMSVideoViewMode;

  /*
   * Whether to show the end button in the PIP window. Default is true. Android only.
   */
  endButton?: boolean;

  /*
   * Whether to show the audio mute/unmute button in the PIP window. Default is true. Android only.
   */
  audioButton?: boolean;

  /*
   * Whether to show the video mute/unmute button in the PIP window. Default is true. Android only.
   */
  videoButton?: boolean;
}
