import type { HMSException, HMSPeer } from "@100mslive/react-native-hms";

export enum MeetingState {
  NOT_JOINED,
  IN_PREVIEW,
  IN_MEETING,
  MEETING_ENDED,
  ERROR,
}

export enum NotificationTypes {
  ROLE_CHANGE_DECLINED = 'role_change_declined',
  HAND_RAISE = 'hand_raise',
  LOCAL_SCREENSHARE = 'local_screenshare',
  EXCEPTION = 'exception',
}

export type Notification =
  | { id: string; type: NotificationTypes; }
  | { id: string; type: NotificationTypes; message: string; }
  | { id: string; type: NotificationTypes; peer: HMSPeer; }
  | { id: string; type: NotificationTypes; exception: HMSException; }
