/**
 * Enum for HMSAudioDevice types.
 *
 * This enum represents the different types of audio devices that can be used
 * in the context of the HMS SDK. It provides a way to specify the preferred
 * audio output device for audio playback.
 *
 * @enum {string}
 */
export enum HMSAudioDevice {
  /** Use the speakerphone for audio output. */
  SPEAKER_PHONE = 'SPEAKER_PHONE',

  /** Use a wired headset for audio output, if connected. */
  WIRED_HEADSET = 'WIRED_HEADSET',

  /** Use the earpiece for audio output. */
  EARPIECE = 'EARPIECE',

  /** Use a Bluetooth device for audio output, if connected. */
  BLUETOOTH = 'BLUETOOTH',

  /** Automatically select the best audio output device based on the current state. */
  AUTOMATIC = 'AUTOMATIC',
}
