import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import type {
  HMSPermissions,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';

import {decodePeer} from '../../utils/functions';
import type {Peer} from '../../utils/types';
import {DisplayTrack} from './DisplayTrack';
import {styles} from './styles';

type MiniViewProps = {
  instance: HMSSDK | undefined;
  speakers: HMSSpeaker[];
  localPeerPermissions: HMSPermissions | undefined;
};

const MiniView = ({
  instance,
  speakers,
  localPeerPermissions,
}: MiniViewProps) => {
  const [mainSpeaker, setMainSpeaker] = useState<Peer | undefined>(undefined);
  const [miniSpeaker, setMiniSpeaker] = useState<Peer | undefined>(undefined);

  useEffect(() => {
    const decodedLocalPeer = decodePeer(instance?.localPeer!);
    if (instance?.remotePeers && instance.remotePeers.length > 0) {
      if (speakers.length > 0) {
        setMainSpeaker(decodePeer(speakers[0].peer));
        setMiniSpeaker(decodedLocalPeer);
      } else {
        setMainSpeaker(decodePeer(instance?.remotePeers[0]));
        setMiniSpeaker(decodedLocalPeer);
      }
    } else {
      setMainSpeaker(decodedLocalPeer);
      setMiniSpeaker(undefined);
    }
  }, [speakers, instance?.remotePeers, instance?.localPeer]);

  return (
    <View style={styles.heroContainer}>
      {mainSpeaker && (
        <View style={styles.mainTileContainer} key={mainSpeaker.trackId}>
          <DisplayTrack
            peer={mainSpeaker}
            instance={instance}
            videoStyles={() => styles.heroView}
            permissions={localPeerPermissions}
            layout="hero"
          />
        </View>
      )}
      {miniSpeaker && (
        <View style={styles.miniTileContainer} key={miniSpeaker.trackId}>
          <DisplayTrack
            peer={miniSpeaker}
            instance={instance}
            videoStyles={() => styles.heroView}
            permissions={localPeerPermissions}
            layout="hero"
          />
        </View>
      )}
    </View>
  );
};

export {MiniView};
