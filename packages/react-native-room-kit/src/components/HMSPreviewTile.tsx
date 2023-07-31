import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';

import { PersonIcon } from '../Icons';
import type { RootState } from '../redux';
import { getInitials } from '../utils/functions';
import { COLORS } from '../utils/theme';
import { HMSLocalVideoView } from './HMSLocalVideoView';

export const HMSPreviewTile: React.FC = () => {
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );
  const localVideoTrackId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.videoTrack?.trackId
  );
  const userName = useSelector((state: RootState) => state.user.userName);

  return (
    <View style={styles.modalContainer}>
      {isLocalVideoMuted || !localVideoTrackId ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {userName.length === 0 ? (
              <PersonIcon style={styles.avatarIcon} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            )}
          </View>
        </View>
      ) : (
        <HMSLocalVideoView />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.BACKGROUND.DIM,
    overflow: 'hidden',
  },
  hmsView: {
    flex: 1,
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 88,
    aspectRatio: 1,
    backgroundColor: COLORS.EXTENDED.PURPLE,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 40,
    height: 40,
  },
  avatarText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 34,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
});
