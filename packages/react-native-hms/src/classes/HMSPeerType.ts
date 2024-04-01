export enum HMSPeerType {
  SIP = 'SIP',
  REGULAR = 'REGULAR',
}

export const HMSPeerTypeOrdinals = new Map([
  ['0', HMSPeerType.SIP],
  ['1', HMSPeerType.REGULAR],
]);
