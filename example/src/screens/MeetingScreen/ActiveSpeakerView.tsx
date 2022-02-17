import React from 'react';
import {View, Dimensions} from 'react-native';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPeer,
  HMSPermissions,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {decodePeer, getHmsViewHeight} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import type {RootState} from '../../redux';
import type {Peer, LayoutParams} from '../../utils/types';

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
};

const getActiveSpeakers = (
  peers: Array<HMSPeer>,
  speakers: Array<HMSSpeaker>,
  speakerIds: Array<string>,
): Peer[] => {
  const currentActiveSpeakers = speakers.map(speaker =>
    decodePeer(speaker?.peer),
  );
  let speakersRequired =
    peers.length >= 4
      ? 4 - currentActiveSpeakers.length
      : peers.length - currentActiveSpeakers.length;
  peers.map(peer => {
    if (speakersRequired !== 0 && !speakerIds.includes(peer.peerID)) {
      currentActiveSpeakers.push(decodePeer(peer));
      speakersRequired--;
    }
  });
  return currentActiveSpeakers;
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
}: ActiveSpeakerViewProps) => {
  const {left, right, top, bottom} = useSafeAreaInsets();
  const currentPeers: HMSPeer[] = [];
  if (instance?.localPeer) {
    currentPeers.push(instance.localPeer);
  }
  if (instance?.remotePeers) {
    currentPeers.push(...instance.remotePeers);
  }
  const data = getActiveSpeakers(currentPeers, speakers, speakerIds);
  return (
    <View
      style={[
        styles.page,
        {width: Dimensions.get('window').width - left - right},
      ]}>
      {data.map(
        (view: Peer) =>
          view?.id && (
            <View
              key={view?.id}
              style={{
                ...getHmsViewHeight(
                  layout,
                  view.type,
                  data.length,
                  top,
                  bottom,
                ),
              }}>
              <DisplayTrack
                peer={view}
                videoStyles={getRemoteVideoStyles}
                speakerIds={speakerIds}
                instance={instance}
                type={view.type}
                permissions={localPeerPermissions}
                layout={layout}
                mirrorLocalVideo={state.user.mirrorLocalVideo}
                setChangeNameModal={setChangeNameModal}
                statsForNerds={statsForNerds}
                rtcStats={rtcStats}
                remoteAudioStats={remoteAudioStats}
                remoteVideoStats={remoteVideoStats}
                localAudioStats={localAudioStats}
                localVideoStats={localVideoStats}
              />
            </View>
          ),
      )}
    </View>
  );
};
export {ActiveSpeakerView};
