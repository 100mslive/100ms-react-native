import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import Toast from 'react-native-simple-toast';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS} from '../utils/theme';

import {BackButton} from './BackButton';
import {HMSManageCameraRotation} from './HMSManageCameraRotation';
import {HMSManageLocalAudio} from './HMSManageLocalAudio';
import {HMSManageLocalVideo} from './HMSManageLocalVideo';
import {HMSPreviewEditName} from './HMSPreviewEditName';
import {HMSPreviewJoinButton} from './HMSPreviewJoinButton';
import {HMSPreviewPeersList} from './HMSPreviewPeersList';
import {HMSPreviewSubtitle} from './HMSPreviewSubtitle';
import {HMSPreviewTile} from './HMSPreviewTile';
import {HMSPreviewTitle} from './HMSPreviewTitle';
import {SettingsIcon} from '../Icons';
import {PressableIcon} from './PressableIcon';

export const Preview = ({
  join,
  loadingButtonState,
}: {
  join(): void;
  loadingButtonState: boolean;
}) => {
  const {bottom} = useSafeAreaInsets();

  useEffect(() => {
    AvoidSoftInput.setAdjustNothing();
    AvoidSoftInput.setEnabled(true);

    return () => AvoidSoftInput.setEnabled(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
      >
        <BackButton />

        <HMSPreviewTitle />

        <HMSPreviewSubtitle />

        <HMSPreviewPeersList />

        <HMSPreviewTile />

        <View style={styles.controlsContainer}>
          <View style={styles.micAndCameraControls}>
            <HMSManageLocalAudio />

            <View style={styles.manageLocalVideoWrapper}>
              <HMSManageLocalVideo />
            </View>

            <HMSManageCameraRotation />
          </View>

          <PressableIcon
            onPress={() =>
              Toast.showWithGravity(
                'Not Implemented Yet!',
                Toast.LONG,
                Toast.CENTER,
              )
            }
          >
            <SettingsIcon />
          </PressableIcon>
        </View>

        <View style={[styles.joinButtonRow, {marginBottom: 34 - bottom + 12}]}>
          <HMSPreviewEditName />

          <HMSPreviewJoinButton onJoin={join} loading={loadingButtonState} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  controlsContainer: {
    marginHorizontal: 24,
    marginTop: 24,
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
    marginHorizontal: 24,
    marginTop: 16,
    flexDirection: 'row',
  },
});
