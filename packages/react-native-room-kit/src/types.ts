import type { HMSException, HMSPeer } from '@100mslive/react-native-hms';
import type { HMSIOSScreenShareConfig, OnLeaveHandler } from './utils/types';

export enum MeetingState {
  NOT_JOINED,
  IN_PREVIEW,
  IN_MEETING,
  EXITED,
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
  onLeave?: OnLeaveHandler;
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

export enum NotificationTypes {
  INFO = 'info',
  ROLE_CHANGE_DECLINED = 'role_change_declined',
  RECONNECTING = 'reconnecting',
  HAND_RAISE = 'hand_raise',
  LOCAL_SCREENSHARE = 'local_screenshare',
  ERROR = 'error',
  TERMINAL_ERROR = 'terminal_error',
}

export type Notification =
  | { id: string; type: NotificationTypes }
  | {
      id: string;
      type: NotificationTypes;
      icon?: string;
      message?: string;
      title: string;
    }
  | { id: string; type: NotificationTypes; icon?: string; peer: HMSPeer }
  | {
      id: string;
      type: NotificationTypes;
      icon?: string;
      exception: HMSException;
    };

export type PinnedMessage = {
  text: string;
  id: string;
  pinnedBy: string;
  authorId: string;
};

export type ChatState = {
  enabled: boolean;
  updatedBy: {
    peerID: string;
    userID: string;
    userName: string;
  };
  updatedAt: number;
};
