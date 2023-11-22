import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { HMSPeer } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';

import { MicIcon } from '../../Icons';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { RootState } from '../../redux';
import { PipModes } from '../../utils/types';

export interface PeerAudioIndicatorProps {
  peer: HMSPeer;
  isMuted: boolean | undefined;
}

export const PeerAudioIndicator: React.FC<PeerAudioIndicatorProps> = ({
  peer,
  isMuted,
}) => {
  const activeSpeaker = useSelector(
    (state: RootState) =>
      state.hmsStates.activeSpeakers.findIndex(
        (activeSpeaker) => activeSpeaker.peer.peerID === peer.peerID
      ) >= 0
  );

  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    iconWrapper: {
      backgroundColor: theme.palette.secondary_dim,
    },
    icon: {
      tintColor: theme.palette.on_secondary_high,
    },
  }));

  if (isMuted) {
    return (
      <View style={[styles.iconWrapper, hmsRoomStyles.iconWrapper]}>
        <MicIcon muted={true} style={[styles.icon, hmsRoomStyles.icon]} />
      </View>
    );
  }

  if (activeSpeaker && !isPipModeActive) {
    return (
      <View style={[styles.speakerIconWrapper, hmsRoomStyles.iconWrapper]}>
        <LottieView
          style={styles.speakerIcon}
          source={require('../../assets/audio-level-white.json')}
          autoPlay
          loop
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 16,
  },
  icon: {
    width: 16,
    height: 16,
  },
  speakerIconWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 0,
    borderRadius: 16,
  },
  speakerIcon: {
    width: 32,
    height: 32,
  },
});
