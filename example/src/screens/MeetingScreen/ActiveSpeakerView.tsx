import React from 'react';
import type {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPeer,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

import {pairDataForFlatlist} from '../../utils/functions';
import type {LayoutParams, ModalTypes, PeerTrackNode} from '../../utils/types';
import {GridView} from './Grid';

type ActiveSpeakerViewProps = {
  speakers: HMSSpeaker[];
  instance: HMSSDK | undefined;
  layout: LayoutParams;
  statsForNerds: boolean;
  rtcStats: HMSRTCStatsReport | undefined;
  remoteAudioStats: any;
  remoteVideoStats: any;
  localAudioStats: HMSLocalAudioStats;
  localVideoStats: HMSLocalVideoStats;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setZoomableTrackId: React.Dispatch<React.SetStateAction<string>>;
  page: number;
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

const checkInPeerList = (peers: Array<HMSPeer>, id?: string): boolean => {
  let rt = false;
  peers.map((peer: HMSPeer) => {
    if (peer.peerID === id) {
      rt = true;
    }
  });
  return rt;
};

let recentActiveSpeakers: PeerTrackNode[] = [];

const getActiveSpeakers = (
  peers: Array<HMSPeer>,
  speakers: Array<HMSSpeaker>,
  speakerIds: Array<string>,
): PeerTrackNode[] => {
  const currentActiveSpeakers: PeerTrackNode[] = speakers.map(speaker => {
    const {peer} = speaker;
    return {
      id: peer.peerID + 'regular',
      peer,
      track: peer.videoTrack,
    };
  });

  let speakersRequired = peers.length - currentActiveSpeakers.length;

  if (recentActiveSpeakers.length === 0) {
    peers.map(peer => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peer.peerID)
      ) {
        currentActiveSpeakers.push({
          id: peer.peerID + 'regular',
          peer,
          track: peer.videoTrack,
        });
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
        currentActiveSpeakers.push(peerTrackNode);
        speakersRequired--;
      }
    });

    peers.map(peer => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peer.peerID)
      ) {
        currentActiveSpeakers.push({
          id: peer.peerID + 'regular',
          peer,
          track: peer.videoTrack,
        });
        speakersRequired--;
      }
    });

    rearrangeActiveSpeakers(recentActiveSpeakers, currentActiveSpeakers);
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);
    return currentActiveSpeakers;
  }
};

const ActiveSpeakerView = ({
  speakers,
  instance,
  layout,
  statsForNerds,
  rtcStats,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  setPage,
  page,
  setModalVisible,
  setZoomableTrackId,
}: ActiveSpeakerViewProps) => {
  const currentPeers: HMSPeer[] = [];
  if (instance?.localPeer) {
    currentPeers.push(instance.localPeer);
  }
  if (instance?.remotePeers) {
    currentPeers.push(...instance.remotePeers);
  }

  const speakerIds = speakers?.map(speaker => speaker?.peer?.peerID);
  const data = getActiveSpeakers(currentPeers, speakers, speakerIds);
  const pairedPeers: Array<Array<PeerTrackNode>> = pairDataForFlatlist(data, 4);

  return (
    <GridView
      setModalVisible={setModalVisible}
      setZoomableTrackId={setZoomableTrackId}
      pairedPeers={pairedPeers}
      setPage={setPage}
      speakers={speakers}
      instance={instance}
      layout={layout}
      statsForNerds={statsForNerds}
      rtcStats={rtcStats}
      remoteAudioStats={remoteAudioStats}
      remoteVideoStats={remoteVideoStats}
      localAudioStats={localAudioStats}
      localVideoStats={localVideoStats}
      page={page}
    />
  );
};
export {ActiveSpeakerView};
