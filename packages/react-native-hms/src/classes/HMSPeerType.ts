/**
 * Enum for HMSPeerType.
 *
 * Defines the types of peers within the HMS (100ms) system. This enumeration is used to distinguish between different
 * kinds of peers, such as SIP (Session Initiation Protocol) peers and regular peers. Each peer type has specific
 * characteristics and roles within the video conferencing or communication context.
 *
 * @enum {string}
 *
 * @see https://www.100ms.live/docs/server-side/v2/how-to-guides/Session%20Initiation%20Protocol%20(SIP)/SIP-Interconnect
 */
export enum HMSPeerType {
  SIP = 'SIP', // Represents a SIP peer, typically used for integrating with traditional telephony systems.
  REGULAR = 'REGULAR', // Represents a regular peer, such as a standard user in a video call.
}

export const HMSPeerTypeOrdinals = new Map([
  ['0', HMSPeerType.SIP],
  ['1', HMSPeerType.REGULAR],
]);
