import type { HMSIOSScreenShareConfig } from "./utils/types";

export enum MeetingState {
  NOT_JOINED,
  IN_PREVIEW,
  IN_MEETING,
  MEETING_ENDED,
  ERROR,
}
export interface HMSPrebuiltProps {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    endPoints?: {
      init: string;
      token: string;
      layout: string;
    };
    debugMode?: boolean;
    ios?: HMSIOSScreenShareConfig;
  };
  /**
   * onLeave - Optional callback function
   *
   * It will be invoked when user leaves meeting or user is removed from the room
   */
  onLeave?: () => void;
  /**
   * [Android Only] handleBackButton - `Optional<Boolean>` | Default value - `false`
   *
   * When `true`, Leave modal will open on press of back button on android
   * otherwise user will leave meeting immediately without any confirmation modal opening
   *
   * Example usage:
   * ```jsx
   * const isScreenFocused = useIsFocused();
   *
   * ...
   *
   * <HMSPrebuilt
   *  {...}
   *  handleBackButton={isScreenFocused}
   * />
   * ```
   */
  handleBackButton?: boolean;
  /**
   * [Android Only] autoEnterPipMode - `Optional<Boolean>` | Default value - `false`
   *
   * When `true`, App will go into PIP mode automatically when user tries to leave or minimize app while it is inside room
   *
   * Example usage:
   * ```jsx
   * <HMSPrebuilt
   *  {...}
   *  autoEnterPipMode={true}
   * />
   * ```
   */
  autoEnterPipMode?: boolean;
}
