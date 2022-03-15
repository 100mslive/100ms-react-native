import React from 'react';
import {Dimensions} from 'react-native';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPeer,
  HMSPermissions,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {decodePeer, pairDataForScrollView} from '../../utils/functions';
// import {styles} from './styles';
// import {DisplayTrack} from './DisplayTrack';
import type {RootState} from '../../redux';
import type {Peer, LayoutParams} from '../../utils/types';
import {SwipeableView} from './SwipeableView';

type ActiveSpeakerViewProps = {
  Dimensions: Dimensions;
  getRemoteVideoStyles: Function;
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
  decodeRemotePeer: Function;
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

  console.log(currentActiveSpeakers, 'currentActiveSpeakers 1');

  // if (currentActiveSpeakers.length >= 4) {
  //   currentActiveSpeakers.length = 4;
  //   return currentActiveSpeakers;
  // }

  let speakersRequired = peers.length - currentActiveSpeakers.length;

  if (recentActiveSpeakers.length === 0) {
    // let speakersRequired = 4 - currentActiveSpeakers.length;
    // let speakersRequired = peers.length - currentActiveSpeakers.length
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

    console.log(currentActiveSpeakers, 'currentActiveSpeakers 2');

    return currentActiveSpeakers;
  } else {
    // let speakersRequired = 4 - currentActiveSpeakers.length;

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

    console.log(currentActiveSpeakers, 'currentActiveSpeakers 3');

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

    console.log(currentActiveSpeakers, 'currentActiveSpeakers 4');

    rearrangeActiveSpeakers(recentActiveSpeakers, currentActiveSpeakers);
    recentActiveSpeakers = currentActiveSpeakers.slice(0, 4);
    return currentActiveSpeakers;
  }
};

const ActiveSpeakerView = ({
  Dimensions,
  speakerIds,
  speakers,
  instance,
  localPeerPermissions,
  layout,
  getRemoteVideoStyles,
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
  decodeRemotePeer,
  hmsInstance,
}: ActiveSpeakerViewProps) => {
  // const {left, right, top, bottom} = useSafeAreaInsets();
  const currentPeers: HMSPeer[] = [];
  if (instance?.localPeer) {
    currentPeers.push(instance.localPeer);
  }
  if (instance?.remotePeers) {
    currentPeers.push(...instance.remotePeers);
  }

  const data = getActiveSpeakers(currentPeers, speakers, speakerIds);
  console.log(data, 'DATA in here');
  const pairedPeers: Array<Array<Peer>> = pairDataForScrollView(data, 4);

  return (
    <SwipeableView
      pairedPeers={pairedPeers}
      setPage={setPage}
      Dimensions={Dimensions}
      setZoomableModal={setZoomableModal}
      setZoomableTrackId={setZoomableTrackId}
      getAuxVideoStyles={getAuxVideoStyles}
      speakerIds={speakerIds}
      instance={instance}
      localPeerPermissions={localPeerPermissions}
      layout={layout}
      getRemoteVideoStyles={getRemoteVideoStyles}
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
      decodeRemotePeer={decodeRemotePeer}
      hmsInstance={hmsInstance}
    />
  );

  // return (
  //   <View
  //     style={[
  //       styles.page,
  //       {width: Dimensions.get('window').width - left - right},
  //     ]}>
  //     {data.map(
  //       (view: Peer) =>
  //         view?.id && (
  //           <View
  //             key={view?.id}
  //             style={{
  //               ...getHmsViewHeight(
  //                 layout,
  //                 view.type,
  //                 data.length,
  //                 top,
  //                 bottom,
  //               ),
  //             }}>
  //             <DisplayTrack
  //               peer={view}
  //               videoStyles={getRemoteVideoStyles}
  //               speakerIds={speakerIds}
  //               instance={instance}
  //               type={view.type}
  //               permissions={localPeerPermissions}
  //               layout={layout}
  //               mirrorLocalVideo={state.user.mirrorLocalVideo}
  //               setChangeNameModal={setChangeNameModal}
  //               statsForNerds={statsForNerds}
  //               rtcStats={rtcStats}
  //               remoteAudioStats={remoteAudioStats}
  //               remoteVideoStats={remoteVideoStats}
  //               localAudioStats={localAudioStats}
  //               localVideoStats={localVideoStats}
  //             />
  //           </View>
  //         ),
  //     )}
  //   </View>
  // );
};
export {ActiveSpeakerView};
