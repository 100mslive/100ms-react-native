import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, Animated} from 'react-native';
import type {HMSSDK, HMSSpeaker} from '@100mslive/react-native-hms';
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
};

const MiniView = ({instance, speakers}: MiniViewProps) => {
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
    const decodedLocalPeer = {
      id: instance?.localPeer?.peerID + 'regular',
      peer: instance?.localPeer!,
      track: instance?.localPeer?.videoTrack,
    };
    if (instance?.remotePeers && instance.remotePeers.length > 0) {
      if (speakers.length > 0) {
        setMainSpeaker({
          id: speakers[0].peer.peerID + 'regular',
          peer: speakers[0].peer,
          track: speakers[0].peer?.videoTrack,
        });
        setMiniSpeaker(decodedLocalPeer);
      } else {
        setMainSpeaker({
          id: instance?.remotePeers[0]?.peerID + 'regular',
          peer: instance?.remotePeers[0],
          track: instance?.remotePeers[0]?.videoTrack,
        });
        setMiniSpeaker(decodedLocalPeer);
      }
    } else {
      setMainSpeaker(decodedLocalPeer);
      setMiniSpeaker(undefined);
    }
  }, [speakers, instance?.remotePeers, instance?.localPeer]);

  return (
    <View style={styles.heroContainer}>
      <GestureHandlerRootView style={styles.container}>
        {mainSpeaker && (
          <View style={styles.mainTileContainer} key={mainSpeaker.id}>
            <DisplayTrack
              peerTrackNode={mainSpeaker}
              instance={instance}
              videoStyles={() => styles.heroView}
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
              ]}
              key={miniSpeaker.id}>
              <DisplayTrack
                miniView={true}
                peerTrackNode={miniSpeaker}
                instance={instance}
                videoStyles={() => styles.heroView}
              />
            </Animated.View>
          </PanGestureHandler>
        )}
      </GestureHandlerRootView>
    </View>
  );
};

export {MiniView};
