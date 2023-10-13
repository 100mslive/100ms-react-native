import type { HMSException, HMSPeer } from "@100mslive/react-native-hms";

export enum MeetingState {
  NOT_JOINED,
  IN_PREVIEW,
  IN_MEETING,
  MEETING_ENDED,
  ERROR,
}

export type Notification =
  | { id: string; type: string; }
  | { id: string; type: string; peer: HMSPeer; }
  | { id: string; type: string; error: HMSException; }