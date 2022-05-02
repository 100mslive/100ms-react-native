import React, {useState, useEffect} from 'react';
import {FlatList, View} from 'react-native';
import type {
  HMSPermissions,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

import {decodePeer} from '../../utils/functions';
import type {RootState} from '../../redux';
import type {Peer} from '../../utils/types';
import {DisplayTrack} from './DisplayTrack';
import {styles} from './styles';

type HeroViewProps = {
  instance: HMSSDK | undefined;
  speakers: HMSSpeaker[];
  state: RootState;
  localPeerPermissions: HMSPermissions | undefined;
  setChangeNameModal: Function;
};

const searchMainSpeaker = (speaker: Peer | undefined, list: Peer[]) => {
  let returnItem = null;
  list.map(item => {
    if (item.id === speaker?.id) {
      returnItem = item;
    }
  });
  return returnItem ? returnItem : list[0];
};

const HeroView = ({
  instance,
  speakers,
  state,
  localPeerPermissions,
  setChangeNameModal,
}: HeroViewProps) => {
  const [mainSpeaker, setMainSpeaker] = useState<Peer | undefined>(undefined);
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    console.log(speakers, 'speakers');
    if (speakers.length > 0) {
      console.log(mainSpeaker);
      setMainSpeaker(decodePeer(speakers[0].peer));
    }
    if (speakers.length === 0 && !mainSpeaker && instance?.localPeer) {
      setMainSpeaker(decodePeer(instance.localPeer));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakers, instance?.remotePeers, instance?.localPeer]);

  useEffect(() => {
    const newPeerList = [];
    if (instance?.localPeer) {
      newPeerList.push(decodePeer(instance?.localPeer));
    }

    if (instance?.remotePeers) {
      instance.remotePeers.map(item => {
        newPeerList.push(decodePeer(item));
      });
    }

    setPeers(newPeerList);
  }, [instance?.remotePeers, instance?.localPeer]);

  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroTileContainer}>
        {mainSpeaker && (
          <DisplayTrack
            key={mainSpeaker.id}
            peer={searchMainSpeaker(mainSpeaker, peers)}
            instance={instance}
            videoStyles={() => styles.heroView}
            permissions={localPeerPermissions}
            mirrorLocalVideo={state.user.mirrorLocalVideo}
            speakerIds={[]}
            type={undefined}
            layout="hero"
            setChangeNameModal={setChangeNameModal}
          />
        )}
      </View>
      <View style={styles.heroListContainer}>
        <FlatList
          data={peers.filter(item => item.id !== mainSpeaker?.id)}
          horizontal={true}
          renderItem={({item}) => {
            return (
              <View style={styles.heroListViewContainer}>
                <DisplayTrack
                  peer={item}
                  instance={instance}
                  videoStyles={() => styles.heroListView}
                  permissions={localPeerPermissions}
                  speakerIds={[]}
                  type={undefined}
                  layout="hero"
                  setChangeNameModal={setChangeNameModal}
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
