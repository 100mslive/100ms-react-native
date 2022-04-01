import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, Animated} from 'react-native';
import type {
  HMSPermissions,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

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
      <GestureHandlerRootView style={styles.container}>
        {mainSpeaker && (
          <View style={styles.mainTileContainer} key={mainSpeaker.trackId}>
            <DisplayTrack
              peer={mainSpeaker}
              instance={instance}
              videoStyles={() => styles.heroView}
              permissions={localPeerPermissions}
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
              key={miniSpeaker.trackId}>
              <DisplayTrack
                miniView={true}
                peer={miniSpeaker}
                instance={instance}
                videoStyles={() => styles.heroView}
                permissions={localPeerPermissions}
              />
            </Animated.View>
          </PanGestureHandler>
        )}
      </GestureHandlerRootView>
    </View>
  );
};

export {MiniView};
