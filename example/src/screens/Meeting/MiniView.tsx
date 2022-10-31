import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, Animated} from 'react-native';
import {
  HMSPermissions,
  HMSSDK,
  HMSSpeaker,
  HMSTrackSource,
} from '@100mslive/react-native-hms';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

import type {PeerTrackNode} from '../../utils/types';
import {DisplayTrack} from './DisplayTrack';
import {styles} from './styles';

type MiniViewProps = {
  instance: HMSSDK | undefined;
  speakers: HMSSpeaker[];
  orientation: boolean;
  peerTrackNodes: PeerTrackNode[];
  permissions?: HMSPermissions;
};

const MiniView = ({
  instance,
  speakers,
  orientation,
  peerTrackNodes,
  permissions,
}: MiniViewProps) => {
  const [mainSpeaker, setMainSpeaker] = useState<PeerTrackNode>();
  const [miniSpeaker, setMiniSpeaker] = useState<PeerTrackNode>();
  const translateX = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(1)).current;

  const handlePan = Animated.event(
    [{nativeEvent: {translationX: translateX, translationY: translateY}}],
    {useNativeDriver: true},
  );

  const onHandlerStateChange = useCallback(() => {
    translateY.extractOffset();
    translateX.extractOffset();
  }, [translateX, translateY]);

  useEffect(() => {
    let decodedRemotePeers: PeerTrackNode[] = [];
    let decodedLocalPeer;
    peerTrackNodes.map(peerTrackNode => {
      if (peerTrackNode.peer.isLocal) {
        decodedLocalPeer = peerTrackNode;
      } else {
        decodedRemotePeers.push(peerTrackNode);
      }
    });
    if (decodedRemotePeers.length > 0) {
      if (speakers.length > 0) {
        setMainSpeaker({
          id: speakers[0].peer.peerID + HMSTrackSource.REGULAR,
          peer: speakers[0].peer,
          track: speakers[0].peer?.videoTrack,
        });
        setMiniSpeaker(decodedLocalPeer);
      } else {
        setMainSpeaker({
          id: decodedRemotePeers[0].peer?.peerID + HMSTrackSource.REGULAR,
          peer: decodedRemotePeers[0].peer,
          track: decodedRemotePeers[0].peer?.videoTrack,
        });
        setMiniSpeaker(decodedLocalPeer);
      }
    } else {
      setMainSpeaker(decodedLocalPeer);
      setMiniSpeaker(undefined);
    }
  }, [peerTrackNodes, speakers]);

  return (
    <View style={styles.heroContainer}>
      <GestureHandlerRootView style={styles.container}>
        {mainSpeaker && (
          <View style={styles.mainTileContainer} key={mainSpeaker.id}>
            <DisplayTrack
              peerTrackNode={mainSpeaker}
              instance={instance}
              videoStyles={styles.heroView}
              permissions={permissions}
            />
          </View>
        )}
        {miniSpeaker && (
          <PanGestureHandler
            onGestureEvent={handlePan}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                {transform: [{translateX}, {translateY}]},
                styles.miniTileContainer,
                !orientation && styles.miniTileContainerLandscape,
              ]}
              key={miniSpeaker.id}>
              <DisplayTrack
                miniView={true}
                peerTrackNode={miniSpeaker}
                instance={instance}
                videoStyles={styles.heroView}
                permissions={permissions}
              />
            </Animated.View>
          </PanGestureHandler>
        )}
      </GestureHandlerRootView>
    </View>
  );
};

export {MiniView};
