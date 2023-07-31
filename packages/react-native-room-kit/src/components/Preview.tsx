import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { HMSManageAudioOutput } from './HMSManageAudioOutput';
import { HMSPreviewNetworkQuality } from './HMSPreviewNetworkQuality';
import { useCanPublishVideo } from '../hooks-sdk';
import { HMSPreviewHLSLiveIndicator } from './HMSPreviewHLSLiveIndicator';

const backButtonEdges = ['top'] as const;
const headerEdges = ['top', 'left', 'right'] as const;

const gradientColorShades = [
  '#000000',
  'rgba(0, 0, 0, 0.9)',
  'rgba(0, 0, 0, 0.7)',
  'rgba(0, 0, 0, 0.1)',
  'rgba(0, 0, 0, 0.05)',
  'rgba(0, 0, 0, 0)',
];
const gradientColorShadeLocations = [0.45, 0.55, 0.7, 0.9, 0.95, 1];

export const Preview = ({
  join,
  loadingButtonState,
}: {
  join(): void;
  loadingButtonState: boolean;
}) => {
  const canPublishVideo = useCanPublishVideo();

  useEffect(() => {
    AvoidSoftInput.setEnabled(true);

    return () => AvoidSoftInput.setEnabled(false);
  }, []);

  return (
    <View style={styles.container}>
      {canPublishVideo ? <HMSPreviewTile /> : null}

      {canPublishVideo ? (
        <LinearGradient
          colors={gradientColorShades}
          locations={gradientColorShadeLocations}
          style={styles.headerGradient}
        />
      ) : null}

      <SafeAreaView
        style={canPublishVideo ? styles.header : null}
        edges={headerEdges}
        mode="margin"
      >
        <HMSPreviewTitle />

        <HMSPreviewSubtitle />

        <View style={styles.peerListWrapper}>
          <HMSPreviewHLSLiveIndicator />

          <HMSPreviewPeersList />
        </View>
      </SafeAreaView>

      <SafeAreaView
        style={styles.backButtonContainer}
        edges={backButtonEdges}
        mode="margin"
      >
        <BackButton />
      </SafeAreaView>

      <View style={styles.footerWrapper}>
        <HMSPreviewNetworkQuality />

        <View style={styles.footer}>
          <View style={styles.controlsContainer}>
            <View style={styles.micAndCameraControls}>
              <HMSManageLocalAudio />

              <View style={styles.manageLocalVideoWrapper}>
                <HMSManageLocalVideo />
              </View>

              <HMSManageCameraRotation />
            </View>

            <HMSManageAudioOutput />
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
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    marginTop: 24,
    zIndex: 20,
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 260,
    zIndex: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  peerListWrapper: {
    flexDirection: 'row',
    marginTop: 16,
    alignSelf: 'center',
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
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 40,
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 30,
  },
  footer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});
