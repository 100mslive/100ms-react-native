import React from 'react';
import {HMSSDK, HMSSpeaker, HMSTrackSource} from '@100mslive/react-native-hms';

import {pairDataForFlatlist} from '../../utils/functions';
import type {LayoutParams, PeerTrackNode} from '../../utils/types';
import {GridView} from './Grid';

type ActiveSpeakerViewProps = {
  peerTrackNodes: PeerTrackNode[];
  speakers: HMSSpeaker[];
  instance?: HMSSDK;
  layout: LayoutParams;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

const includesPeerId = (speakers: PeerTrackNode[], peerId: string): boolean => {
  for (let i = 0; i < speakers.length; i++) {
    if (speakers[i]?.peer.peerID === peerId) {
      return true;
    }
  }
  return false;
};

const findPeerIndex = (peer: PeerTrackNode, speakers: PeerTrackNode[]) => {
  let id = -1;
  speakers.map((speaker: PeerTrackNode, index: number) => {
    if (speaker?.peer?.peerID === peer?.peer?.peerID) {
      id = index;
    }
  });
  return id;
};

const rearrangeActiveSpeakers = (
  recentSpeakers: PeerTrackNode[],
  currentSpeakers: PeerTrackNode[],
) => {
  if (recentActiveSpeakers.length <= currentSpeakers.length) {
    currentSpeakers.map((item: PeerTrackNode, index: number) => {
      if (index > 3) {
        return;
      }
      let recentIndex = findPeerIndex(item, recentSpeakers);
      if (recentIndex !== -1 && recentIndex < 4) {
        // Swap
        let temp = currentSpeakers[recentIndex];
        currentSpeakers[recentIndex] = currentSpeakers[index];
        currentSpeakers[index] = temp;
      }
    });
  }
};

const checkInPeerList = (peers: Array<PeerTrackNode>, id?: string): boolean => {
  let rt = false;
  peers.map(peerTrackNode => {
    if (peerTrackNode.peer.peerID === id) {
      rt = true;
    }
  });
  return rt;
};

let recentActiveSpeakers: PeerTrackNode[] = [];

const getActiveSpeakers = (
  peers: Array<PeerTrackNode>,
  speakers: Array<HMSSpeaker>,
  speakerIds: Array<string>,
): PeerTrackNode[] => {
  const currentActiveSpeakers: PeerTrackNode[] = speakers.map(speaker => {
    const {peer} = speaker;
    return {
      id: peer.peerID + HMSTrackSource.REGULAR,
      peer,
      track: peer.videoTrack,
    };
  });

  let speakersRequired = peers.length - currentActiveSpeakers.length;

  if (recentActiveSpeakers.length === 0) {
    peers.map(peerTrackNode => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peerTrackNode.peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peerTrackNode.peer.peerID)
      ) {
        currentActiveSpeakers.push(peerTrackNode);
        speakersRequired--;
      }
    });
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);

    return currentActiveSpeakers;
  } else {
    recentActiveSpeakers.map(peerTrackNode => {
      if (
        speakersRequired > 0 &&
        !includesPeerId(
          currentActiveSpeakers,
          peerTrackNode?.peer?.peerID ? peerTrackNode?.peer?.peerID : ' ',
        ) &&
        checkInPeerList(peers, peerTrackNode?.peer?.peerID)
      ) {
        const updatedPeerTrackNode = getUpdatedPeerTrackNode(
          peerTrackNode,
          peers,
        );
        currentActiveSpeakers.push(updatedPeerTrackNode);
        speakersRequired--;
      }
    });

    peers.map(peerTrackNode => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peerTrackNode.peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peerTrackNode.peer.peerID)
      ) {
        currentActiveSpeakers.push(peerTrackNode);
        speakersRequired--;
      }
    });

    rearrangeActiveSpeakers(recentActiveSpeakers, currentActiveSpeakers);
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);
    return currentActiveSpeakers;
  }
};

const getUpdatedPeerTrackNode = (
  oldPeerTrackNode: PeerTrackNode,
  peerTrackNodes: PeerTrackNode[],
) => {
  let updatedPeerTrackNode = oldPeerTrackNode;
  peerTrackNodes.map(peerTrackNode => {
    if (oldPeerTrackNode.id === peerTrackNode.id) {
      updatedPeerTrackNode = peerTrackNode;
    }
  });
  return updatedPeerTrackNode;
};

const ActiveSpeakerView = ({
  peerTrackNodes,
  speakers,
  instance,
  layout,
  setPage,
  page,
}: ActiveSpeakerViewProps) => {
  const speakerIds = speakers?.map(speaker => speaker?.peer?.peerID);
  const data = getActiveSpeakers(peerTrackNodes, speakers, speakerIds);
  const pairedPeers: Array<Array<PeerTrackNode>> = pairDataForFlatlist(data, 4);

  return (
    <GridView
      pairedPeers={pairedPeers}
      setPage={setPage}
      speakers={speakers}
      instance={instance}
      layout={layout}
      page={page}
    />
  );
};
export {ActiveSpeakerView};
