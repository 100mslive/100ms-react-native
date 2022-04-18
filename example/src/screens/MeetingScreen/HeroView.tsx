import React, {useState, useEffect} from 'react';
import {FlatList, View} from 'react-native';
import type {HMSSDK, HMSSpeaker} from '@100mslive/react-native-hms';

import {LayoutParams, PeerTrackNode} from '../../utils/types';
import {DisplayTrack} from './DisplayTrack';
import {styles} from './styles';

type HeroViewProps = {
  instance: HMSSDK | undefined;
  speakers: HMSSpeaker[];
  setModalVisible: Function;
};

const searchMainSpeaker = (
  speaker: PeerTrackNode | undefined,
  list: PeerTrackNode[],
) => {
  let returnItem = null;
  list.map(item => {
    if (item?.peer?.peerID === speaker?.peer?.peerID) {
      returnItem = item;
    }
  });
  return returnItem ? returnItem : list[0];
};

const HeroView = ({instance, speakers, setModalVisible}: HeroViewProps) => {
  const [mainSpeaker, setMainSpeaker] = useState<PeerTrackNode>();
  const [peers, setPeers] = useState<PeerTrackNode[]>([]);

  useEffect(() => {
    if (speakers.length > 0) {
      const peer = speakers[0].peer;
      setMainSpeaker({
        id: peer.peerID + 'regular',
        peer,
        track: peer.videoTrack,
      });
    }
    if (speakers.length === 0 && !mainSpeaker && instance?.localPeer) {
      const peer = instance.localPeer;
      setMainSpeaker({
        id: peer.peerID + 'regular',
        peer,
        track: peer.videoTrack,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakers, instance?.remotePeers, instance?.localPeer]);

  useEffect(() => {
    const newPeerList: PeerTrackNode[] = [];
    if (instance?.localPeer) {
      const peer = instance.localPeer;
      newPeerList.push({
        id: peer.peerID + 'regular',
        peer,
        track: peer.videoTrack,
      });
    }

    if (instance?.remotePeers) {
      instance.remotePeers.map(item => {
        const peer = item;
        newPeerList.push({
          id: peer.peerID + 'regular',
          peer,
          track: peer.videoTrack,
        });
      });
    }

    setPeers(newPeerList);
  }, [instance?.remotePeers, instance?.localPeer]);

  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroTileContainer}>
        {mainSpeaker && (
          <DisplayTrack
            key={mainSpeaker?.id}
            peerTrackNode={searchMainSpeaker(mainSpeaker, peers)}
            videoStyles={styles.heroView}
            instance={instance}
            layout={LayoutParams.HERO}
            setModalVisible={setModalVisible}
          />
        )}
      </View>
      <View style={styles.heroListContainer}>
        <FlatList
          data={peers.filter(
            item => item?.peer?.peerID !== mainSpeaker?.peer?.peerID,
          )}
          horizontal={true}
          renderItem={({item}) => {
            return (
              <View style={styles.heroListViewContainer}>
                <DisplayTrack
                  key={item?.id}
                  videoStyles={styles.heroListView}
                  peerTrackNode={item}
                  instance={instance}
                  layout={LayoutParams.HERO}
                  setModalVisible={setModalVisible}
                />
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export {HeroView};
