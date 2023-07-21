import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import { useSelector } from 'react-redux';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS } from '../utils/theme';

import { BackButton } from './BackButton';
import { HMSManageCameraRotation } from './HMSManageCameraRotation';
import { HMSManageLocalAudio } from './HMSManageLocalAudio';
import { HMSManageLocalVideo } from './HMSManageLocalVideo';
import { HMSPreviewEditName } from './HMSPreviewEditName';
import { HMSPreviewJoinButton } from './HMSPreviewJoinButton';
import { HMSPreviewPeersList } from './HMSPreviewPeersList';
import { HMSPreviewSubtitle } from './HMSPreviewSubtitle';
import { HMSPreviewTile } from './HMSPreviewTile';
import { HMSPreviewTitle } from './HMSPreviewTitle';
import { HMSPreviewDeviceSettings } from './HMSPreviewDeviceSettings';
import { GenericLogoIcon, NetworkQualityIcon } from '../Icons';
import type { RootState } from '../redux';

export const Preview = ({
  join,
  loadingButtonState,
}: {
  join(): void;
  loadingButtonState: boolean;
}) => {
  const localPeerNetworkQuality = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.networkQuality?.downlinkQuality
  );

  useEffect(() => {
    AvoidSoftInput.setAdjustNothing();
    AvoidSoftInput.setEnabled(true);

    return () => AvoidSoftInput.setEnabled(false);
  }, []);

  return (
    <View style={styles.container}>
      <HMSPreviewTile />

      <LinearGradient
        colors={[
          '#000000',
          'rgba(0, 0, 0, 0.9)',
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.05)',
          'rgba(0, 0, 0, 0)',
        ]}
        locations={[0.45, 0.55, 0.7, 0.9, 0.95, 1]}
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          height: 260,
        }}
      />

      <SafeAreaView
        style={{ position: 'absolute', top: 0, width: '100%', marginTop: 24 }}
        edges={['top', 'left', 'right']}
        mode="margin"
      >
        <GenericLogoIcon style={{ alignSelf: 'center', marginBottom: 16 }} />

        <HMSPreviewTitle />

        <HMSPreviewSubtitle />

        <HMSPreviewPeersList />
      </SafeAreaView>

      <SafeAreaView
        style={{ position: 'absolute', top: 0 }}
        edges={['top']}
        mode="margin"
      >
        <BackButton />
      </SafeAreaView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }}
      >
        <View
          style={{
            marginLeft: 8,
            marginBottom: 8,
            borderRadius: 8,
            paddingVertical: 4,
            paddingHorizontal: 8,
            backgroundColor: COLORS.BACKGROUND.DIM_80,
            alignSelf: 'flex-start',
          }}
        >
          <NetworkQualityIcon quality={localPeerNetworkQuality} />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.BACKGROUND.DEFAULT,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
          }}
        >
          <View style={styles.controlsContainer}>
            <View style={styles.micAndCameraControls}>
              <HMSManageLocalAudio />

              <View style={styles.manageLocalVideoWrapper}>
                <HMSManageLocalVideo />
              </View>

              <HMSManageCameraRotation />
            </View>

            <HMSPreviewDeviceSettings />
          </View>

          <View style={styles.joinButtonRow}>
            <HMSPreviewEditName />

            <HMSPreviewJoinButton onJoin={join} loading={loadingButtonState} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  micAndCameraControls: {
    flexDirection: 'row',
  },
  manageLocalVideoWrapper: {
    marginHorizontal: 16,
  },
  joinButtonRow: {
    marginVertical: 16,
    flexDirection: 'row',
  },
});
