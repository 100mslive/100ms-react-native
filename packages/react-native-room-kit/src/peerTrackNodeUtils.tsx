import {
  HMSPeer,
  HMSTrack,
  HMSTrackSource,
  HMSTrackType,
} from '@100mslive/react-native-hms';

import type { PeerTrackNode } from './utils/types';

export const degradeOrRestorePeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack,
  isDegraded: boolean
): PeerTrackNode[] => {
  const uniqueId = createPeerTrackNodeUniqueId(peer, track);

  return peerTrackNodes.map((peerTrackNode) => {
    if (peerTrackNode.id !== uniqueId) {
      return peerTrackNode;
    }
    return {
      ...peerTrackNode,
      isDegraded,
    };
  });
};

export const removePeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peerToRemove: HMSPeer
): PeerTrackNode[] => {
  return peerTrackNodes.filter(
    (peerTrackNode) => peerTrackNode.peer.peerID !== peerToRemove.peerID
  );
};

export const removePeerTrackNodesWithTrack = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
  return peerTrackNodes.filter(
    (peerTrackNode) => peerTrackNode.id !== uniqueId
  );
};

export const replacePeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peerToReplace: HMSPeer
): PeerTrackNode[] => {
  return peerTrackNodes.map((peerTrackNode) => {
    if (peerTrackNode.peer.peerID !== peerToReplace.peerID) {
      return peerTrackNode;
    }
    return {
      ...peerTrackNode,
      peer: peerToReplace,
    };
  });
};

export const replacePeerTrackNodesWithTrack = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack
): PeerTrackNode[] => {
  const uniqueId = peer.peerID + (track.source ?? HMSTrackSource.REGULAR);
  return peerTrackNodes.map((peerTrackNode) => {
    if (peerTrackNode.id !== uniqueId) {
      return peerTrackNode;
    }
    return {
      ...peerTrackNode,
      peer,
      track,
    };
  });
};

export const peerTrackNodeExistForPeer = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer
): boolean => {
  return (
    peerTrackNodes.findIndex(
      (peerTrackNode) => peerTrackNode.peer.peerID === peer.peerID
    ) >= 0
  );
};

export const peerTrackNodeExistForPeerAndTrack = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack
): boolean => {
  const uniqueId = createPeerTrackNodeUniqueId(peer, track);

  return (
    peerTrackNodes.findIndex(
      (peerTrackNode) => peerTrackNode.id === uniqueId
    ) >= 0
  );
};

export const createPeerTrackNodeUniqueId = (peer: HMSPeer, track: HMSTrack) => {
  const uniqueId =
    peer.peerID +
    (track.type === HMSTrackType.VIDEO
      ? track?.source || HMSTrackSource.REGULAR
      : HMSTrackSource.REGULAR);

  return uniqueId;
};
