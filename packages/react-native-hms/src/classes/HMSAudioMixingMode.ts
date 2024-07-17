/**
 * Enum for HMS Audio Mixing Mode options.
 *
 * Defines the modes available for audio mixing in a session. These modes determine how audio tracks are mixed and played back.
 *
 * - `TALK_ONLY`: Only the talk (voice) track is active, suitable for sessions focusing on voice communication.
 * - `TALK_AND_MUSIC`: Both talk and music tracks are active, allowing for background music with clear voice overlay.
 * - `MUSIC_ONLY`: Only the music track is active, ideal for sessions focusing on music playback.
 *
 * @see https://www.100ms.live/docs/react-native/v2/features/audio-share
 */
export enum HMSAudioMixingMode {
  TALK_ONLY = 'TALK_ONLY',
  TALK_AND_MUSIC = 'TALK_AND_MUSIC',
  MUSIC_ONLY = 'MUSIC_ONLY',
}
