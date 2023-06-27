import * as React from 'react';
import {useSelector} from 'react-redux';
import {HMSVideoViewMode} from '@100mslive/react-native-hms';
import {StyleSheet, Text, View} from 'react-native';

import {MicIcon, NetworkQualityIcon} from '../Icons';
import {useHMSInstance} from '../hooks-util';
import type {RootState} from '../redux';
import {getInitials} from '../utils/functions';
import {COLORS} from '../utils/theme';

export const HMSPreviewTile: React.FC = () => {
  const hmsInstance = useHMSInstance();
  const HmsView = hmsInstance.HmsView;
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera,
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast,
  );
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted,
  );
  const isLocalAudioMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalAudioMuted,
  );
  const localVideoTrackId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.videoTrack?.trackId,
  );
  const localPeerNetworkQuality = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.networkQuality?.downlinkQuality,
  );
  const userName = useSelector((state: RootState) => state.user.userName);

  React.useEffect(() => {
    hmsInstance.enableNetworkQualityUpdates();

    return () => hmsInstance.disableNetworkQualityUpdates();
  }, []);

  return (
    <View style={styles.modalContainer}>
      {isLocalVideoMuted || !localVideoTrackId ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
          </View>
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

      {isLocalAudioMuted ? (
        <View style={styles.micMuted}>
          <MicIcon muted={true} style={styles.micMutedIcon} />
        </View>
      ) : null}

      <View style={styles.nameInTileContainer}>
        {userName ? <Text style={styles.nameInTile}>{userName}</Text> : null}

        <NetworkQualityIcon quality={localPeerNetworkQuality} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
    marginHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'center',
    overflow: 'hidden',
    aspectRatio: 377 / 482, // TODO: DO WE NEED THIS?
  },
  hmsView: {
    flex: 1,
  },
  micMuted: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.ALERT.ERROR.DEFAULT,
    padding: 8,
    borderRadius: 12,
  },
  micMutedIcon: {
    tintColor: COLORS.ALERT.ERROR.BRIGHTER,
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
  avatarText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 34,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
  nameInTileContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.BACKGROUND.DIM_80,
    padding: 8,
    borderRadius: 12,
    flexDirection: 'row',
  },
  nameInTile: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
    marginRight: 8,
  },
});
