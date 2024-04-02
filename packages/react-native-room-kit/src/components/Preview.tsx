import React, { useEffect } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

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
import {
  useCanPublishAudio,
  useCanPublishVideo,
  useHMSActions,
} from '../hooks-sdk';
import { HMSPreviewHLSLiveIndicator } from './HMSPreviewHLSLiveIndicator';
import { CompanyLogo } from './CompanyLogo';
import {
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
  useIsHLSViewer,
} from '../hooks-util';
import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { hexToRgbA } from '../utils/theme';
import { HMSManageNoiseCancellation } from './HMSManageNoiseCancellation';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';

const backButtonEdges = ['top'] as const;
const headerEdges = ['top', 'left', 'right'] as const;

const gradientColorShadeLocations = [0.45, 0.55, 0.7, 0.9, 0.95, 1];

export const Preview = ({
  join,
  loadingButtonState,
}: {
  join(): void;
  loadingButtonState: boolean;
}) => {
  const canPublishVideo = useCanPublishVideo();
  const isHLSViewer = useIsHLSViewer();

  const { background_dim } = useHMSRoomColorPalette();

  const gradientColorShades = React.useMemo(
    () =>
      background_dim
        ? [
            hexToRgbA(background_dim, 1),
            hexToRgbA(background_dim, 0.9),
            hexToRgbA(background_dim, 0.7),
            hexToRgbA(background_dim, 0.1),
            hexToRgbA(background_dim, 0.05),
            hexToRgbA(background_dim, 0),
          ]
        : [],
    [background_dim]
  );

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme) => ({
      container: {
        backgroundColor: theme.palette.background_dim,
      },
      footer: {
        backgroundColor: theme.palette.background_default,
      },
    }),
    []
  );

  const hmsActions = useHMSActions();

  useEffect(() => {
    async function setupAudioVideoOnPreview() {
      // TODO: rectify the below issue,
      // false means audio/video is enabled, true means audio/video is disabled
      // it should have been true means audio/video is enabled, false means audio/video is disabled
      await hmsActions.setLocalAudioEnabled(false);
      await hmsActions.setLocalVideoEnabled(false);
    }
    setupAudioVideoOnPreview().then((r) => console.log(r));
  }, []);

  const canPublishAudio = useCanPublishAudio();
  const isLocalAudioMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalAudioMuted
  );

  const showNoiseCancellationButton = canPublishAudio && !isLocalAudioMuted;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, hmsRoomStyles.container]}>
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
          <CompanyLogo style={styles.logo} />

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

        <SafeAreaView edges={['left', 'right']} style={styles.footerWrapper}>
          <HMSPreviewNetworkQuality />

          <HMSKeyboardAvoidingView
            style={[styles.footer, hmsRoomStyles.footer]}
          >
            {isHLSViewer ? null : (
              <View style={styles.controlsContainer}>
                <View style={styles.micAndCameraControls}>
                  <HMSManageLocalAudio />

                  <View style={styles.manageLocalButtonWrapper}>
                    <HMSManageLocalVideo />
                  </View>

                  <HMSManageCameraRotation />
                </View>

                {showNoiseCancellationButton && <HMSManageNoiseCancellation />}

                <HMSManageAudioOutput />
              </View>
            )}

            <View style={styles.joinButtonRow}>
              <HMSPreviewEditName />

              <HMSPreviewJoinButton
                onJoin={join}
                loading={loadingButtonState}
              />
            </View>
          </HMSKeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  logo: {
    alignSelf: 'center',
    marginBottom: 16,
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
    alignItems: 'center',
  },
  manageLocalButtonWrapper: {
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
});
