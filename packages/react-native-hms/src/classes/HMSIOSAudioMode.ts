/**
 * Enum for specifying the audio mode in an iOS environment within a 100ms (HMS) application.
 *
 * This enumeration provides options to configure the audio mode for an iOS application using the 100ms (HMS) SDK.
 * It allows for the selection between `voice` and `music` modes, catering to different use cases such as
 * prioritizing voice clarity or enhancing music quality during a session.
 *
 * @enum {string}
 * @property {string} VOICE - Configures the audio session for optimized voice communication.
 *                            This mode enhances voice clarity, making it suitable for calls or conferences.
 * @property {string} MUSIC - Configures the audio session for music playback.
 *                            This mode enhances music fidelity, making it suitable for streams or recordings that prioritize music quality.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/microphone/music-mode
 */
export enum HMSIOSAudioMode {
  VOICE = 'voice',
  MUSIC = 'music',
}
