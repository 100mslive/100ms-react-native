/**
 Represents the peer information associated with a poll response. The properties are filled according to HMSPollUserTrackingMode selected for the poll.
 */
export interface HMSPollResponsePeerInfo {
  /**
   The user hash associated with the peer.
   */
  userHash?: string;

  /**
   The peer ID associated with the response.
   */
  peerID?: string;

  /**
   The user ID associated with the peer.
   */
  customerUserID?: string;

  /**
   The username associated with the peer.
   */
  userName?: string;
}
