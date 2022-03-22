import React from 'react';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPeer,
  HMSPermissions,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

import {decodePeer, pairDataForScrollView} from '../../utils/functions';
import type {RootState} from '../../redux';
import type {Peer, LayoutParams} from '../../utils/types';
import {GridView} from './Grid';

type ActiveSpeakerViewProps = {
  speakerIds: string[];
  speakers: HMSSpeaker[];
  instance: HMSSDK | undefined;
  localPeerPermissions: HMSPermissions | undefined;
  layout: LayoutParams;
  state: RootState;
  setChangeNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  statsForNerds: boolean;
  rtcStats: HMSRTCStatsReport | undefined;
  remoteAudioStats: any;
  remoteVideoStats: any;
  localAudioStats: HMSLocalAudioStats;
  localVideoStats: HMSLocalVideoStats;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setZoomableModal: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomableTrackId: React.Dispatch<React.SetStateAction<string>>;
  getAuxVideoStyles: Function;
  page: number;
  setRemoteTrackIds: React.Dispatch<React.SetStateAction<Peer[]>>;
  hmsInstance: HMSSDK | undefined;
};

const includesPeerId = (speakers: Peer[], peerId: string): boolean => {
  for (let i = 0; i < speakers.length; i++) {
    if (speakers[i].id === peerId) {
      return true;
    }
  }
  return false;
};

const findPeerIndex = (peer: Peer, speakers: Peer[]) => {
  let id = -1;
  speakers.map((speaker: Peer, index: number) => {
    if (speaker.id === peer.id) {
      id = index;
    }
  });
  return id;
};

const rearrangeActiveSpeakers = (
  recentSpeakers: Peer[],
  currentSpeakers: Peer[],
) => {
  if (recentActiveSpeakers.length <= currentSpeakers.length) {
    currentSpeakers.map((item: Peer, index: number) => {
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

let recentActiveSpeakers: Peer[] = [];

const getActiveSpeakers = (
  peers: Array<HMSPeer>,
  speakers: Array<HMSSpeaker>,
  speakerIds: Array<string>,
): Peer[] => {
  const currentActiveSpeakers = speakers.map(speaker =>
    decodePeer(speaker?.peer),
  );

  let speakersRequired = peers.length - currentActiveSpeakers.length;

  if (recentActiveSpeakers.length === 0) {
    peers.map(peer => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peer.peerID)
      ) {
        currentActiveSpeakers.push(decodePeer(peer));
        speakersRequired--;
      }
    });
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);

    return currentActiveSpeakers;
  } else {
    recentActiveSpeakers.map(peer => {
      if (
        speakersRequired > 0 &&
        !includesPeerId(currentActiveSpeakers, peer.id ? peer.id : ' ') &&
        checkInPeerList(peers, peer.id)
      ) {
        currentActiveSpeakers.push(peer);
        speakersRequired--;
      }
    });

    peers.map(peer => {
      if (
        speakersRequired > 0 &&
        !speakerIds.includes(peer.peerID) &&
        !includesPeerId(currentActiveSpeakers, peer.peerID)
      ) {
        currentActiveSpeakers.push(decodePeer(peer));
        speakersRequired--;
      }
    });

    rearrangeActiveSpeakers(recentActiveSpeakers, currentActiveSpeakers);
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);
    return currentActiveSpeakers;
  }
};

const ActiveSpeakerView = ({
  speakerIds,
  speakers,
  instance,
  localPeerPermissions,
  layout,
  state,
  setChangeNameModal,
  statsForNerds,
  rtcStats,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  setPage,
  setZoomableModal,
  setZoomableTrackId,
  getAuxVideoStyles,
  page,
  setRemoteTrackIds,
  hmsInstance,
}: ActiveSpeakerViewProps) => {
  const currentPeers: HMSPeer[] = [];
  if (instance?.localPeer) {
    currentPeers.push(instance.localPeer);
  }
  if (instance?.remotePeers) {
    currentPeers.push(...instance.remotePeers);
  }

  const data = getActiveSpeakers(currentPeers, speakers, speakerIds);
  const pairedPeers: Array<Array<Peer>> = pairDataForScrollView(data, 4);

  return (
    <GridView
      pairedPeers={pairedPeers}
      setPage={setPage}
      setZoomableModal={setZoomableModal}
      setZoomableTrackId={setZoomableTrackId}
      getAuxVideoStyles={getAuxVideoStyles}
      speakerIds={speakerIds}
      instance={instance}
      localPeerPermissions={localPeerPermissions}
      layout={layout}
      state={state}
      setChangeNameModal={setChangeNameModal}
      statsForNerds={statsForNerds}
      rtcStats={rtcStats}
      remoteAudioStats={remoteAudioStats}
      remoteVideoStats={remoteVideoStats}
      localAudioStats={localAudioStats}
      localVideoStats={localVideoStats}
      page={page}
      setRemoteTrackIds={setRemoteTrackIds}
      hmsInstance={hmsInstance}
    />
  );
};
export {ActiveSpeakerView};
