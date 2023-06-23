import React from 'react';
import {useSelector} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import {HMSVideoViewMode} from '@100mslive/react-native-hms';

import type {RootState} from '../redux';
import {COLORS} from '../utils/theme';
import {getInitials} from '../utils/functions';
import {useHMSInstance} from '../hooks-util';

export const HMSPreviewTile: React.FC = () => {
  const HmsView = useHMSInstance().HmsView;
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera,
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast,
  );
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted,
  );
  const localVideoTrackId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.videoTrack?.trackId,
  );
  const localPeerName = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.name,
  );

  return (
    <View style={styles.modalContainer}>
      {isLocalVideoMuted || !localVideoTrackId ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(localPeerName)}</Text>
          </View>
          <Text style={styles.name}>{localPeerName}</Text>
        </View>
      ) : (
        <HmsView
          trackId={localVideoTrackId}
          key={localVideoTrackId}
          mirror={mirrorCamera}
          autoSimulcast={autoSimulcast}
          scaleType={HMSVideoViewMode.ASPECT_FILL}
          style={styles.hmsView}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  name: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.25,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    paddingTop: 16,
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  avatar: {
    width: 144,
    aspectRatio: 1,
    backgroundColor: COLORS.TWIN.PURPLE,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 48,
    lineHeight: 52,
    textAlign: 'center',
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
