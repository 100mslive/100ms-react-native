export enum HMSPeerUpdate {
  PEER_JOINED = 'PEER_JOINED',
  PEER_LEFT = 'PEER_LEFT',
  METADATA_CHANGED = 'METADATA_CHANGED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  NAME_CHANGED = 'NAME_CHANGED',
  NETWORK_QUALITY_UPDATED = 'NETWORK_QUALITY_UPDATED',
}

export const HMSPeerUpdateOrdinals = new Map([
  ['0', HMSPeerUpdate.PEER_JOINED],
  ['1', HMSPeerUpdate.PEER_LEFT],
  ['4', HMSPeerUpdate.ROLE_CHANGED],
  ['5', HMSPeerUpdate.NAME_CHANGED],
  ['6', HMSPeerUpdate.METADATA_CHANGED],
  ['7', HMSPeerUpdate.NETWORK_QUALITY_UPDATED],
]);