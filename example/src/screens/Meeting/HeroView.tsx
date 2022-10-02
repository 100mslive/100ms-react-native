import React, {useState, useEffect} from 'react';
import {FlatList, View} from 'react-native';
import type {
  HMSLocalPeer,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

import {LayoutParams, PeerTrackNode} from '../../utils/types';
import {DisplayTrack} from './DisplayTrack';
import {styles} from './styles';
import {createPeerTrackNode} from '../../utils/functions';

type HeroViewProps = {
  instance: HMSSDK | undefined;
  speakers: HMSSpeaker[];
  setModalVisible: Function;
  peerTrackNodes: PeerTrackNode[];
  orientation: boolean;
  localPeer?: HMSLocalPeer;
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

const HeroView = ({
  instance,
  speakers,
  setModalVisible,
  orientation,
  peerTrackNodes,
  localPeer,
}: HeroViewProps) => {
  const [mainSpeaker, setMainSpeaker] = useState<PeerTrackNode>();
  const [peers, setPeers] = useState<PeerTrackNode[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<PeerTrackNode[]>([]);

  useEffect(() => {
    if (speakers.length > 0) {
      const peer = speakers[0].peer;
      setMainSpeaker(createPeerTrackNode(peer));
    }
    if (speakers.length === 0 && !mainSpeaker && localPeer) {
      const peer = localPeer;
      setMainSpeaker(createPeerTrackNode(peer));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakers, localPeer]);

  useEffect(() => {
    const newPeerList = peerTrackNodes;

    setFilteredPeers(
      newPeerList.filter(
        item => item.id !== searchMainSpeaker(mainSpeaker, newPeerList)?.id,
      ),
    );
    setPeers(newPeerList);
  }, [mainSpeaker, peerTrackNodes]);

  return (
    <View
      style={[
        styles.heroContainer,
        !orientation && styles.heroContainerLandscaspe,
      ]}>
      <View
        style={
          filteredPeers.length
            ? [
                styles.heroTileContainer,
                !orientation && styles.heroTileContainerLandscaspe,
              ]
            : styles.heroTileContainerSingle
        }>
        {mainSpeaker && (
          <DisplayTrack
            key={mainSpeaker?.id}
            peerTrackNode={searchMainSpeaker(mainSpeaker, peers)}
            videoStyles={styles.heroView}
            instance={instance}
            layout={LayoutParams.HERO}
            setModalVisible={setModalVisible}
            permissions={localPeer?.role?.permissions}
          />
        )}
      </View>
      <View
        style={
          orientation
            ? styles.heroListContainer
            : styles.heroListContainerLandscaspe
        }>
        <FlatList
          data={filteredPeers}
          horizontal={orientation}
          renderItem={({item}) => {
            return (
              <View
                style={[
                  styles.heroListViewContainer,
                  !orientation && styles.heroListViewContainerLandscaspe,
                ]}>
                <DisplayTrack
                  key={item?.id}
                  videoStyles={
                    orientation
                      ? styles.heroListView
                      : styles.heroListViewLandscaspe
                  }
                  peerTrackNode={item}
                  instance={instance}
                  layout={LayoutParams.HERO}
                  setModalVisible={setModalVisible}
                  permissions={localPeer?.role?.permissions}
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
