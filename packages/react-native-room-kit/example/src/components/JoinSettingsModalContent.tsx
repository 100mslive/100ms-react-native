import React from 'react';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { COLORS } from '../utils/theme';
import { version as hmsRNSdkVersion } from '../../../../react-native-hms/package.json';
import { version as hmsRoomKitVersion } from '../../../package.json';
import {
  ios as hmsIOSSdkVersion,
  android as hmsAndroidSdkVersion,
} from '../../../../react-native-hms/sdk-versions.json';
import { SwitchRow } from './SwitchRow';
import { RootState } from '../redux';
import {
  changeAudioMixer,
  changeJoinAudioMuted,
  changeJoinSkipPreview,
  changeJoinVideoMuted,
  changeMirrorCamera,
  changeSoftwareDecoder,
  changeAutoResize,
  changeAutoSimulcast,
  resetJoinConfig,
  changeMusicMode,
  changeDebugMode,
  changeUseStaticUserId,
} from '../redux/actions';
import { Constants } from '../utils/types';

interface JoinSettingsModalContentProps {}

export const JoinSettingsModalContent: React.FC<
  JoinSettingsModalContentProps
> = () => {
  const dispatch = useDispatch();
  const joinConfig = useSelector((state: RootState) => state.app.joinConfig);
  const {
    debugMode,
    mutedAudio,
    mutedVideo,
    skipPreview,
    mirrorCamera,
    audioMixer,
    musicMode,
    softwareDecoder,
    autoResize,
    autoSimulcast,
    staticUserId,
  } = joinConfig;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Room Settings</Text>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1 }}>
          <SwitchRow
            text="Debug Info"
            value={debugMode}
            onChange={(value) => dispatch(changeDebugMode(value))}
            containerStyle={styles.switchContainer}
          />

          {debugMode ? (
            <>
              <SwitchRow
                text={`Static UserId (${Constants.STATIC_USERID})`}
                value={staticUserId}
                onChange={(value) => dispatch(changeUseStaticUserId(value))}
                containerStyle={styles.switchContainer}
              />

              <SwitchRow
                text="Join with Muted Audio"
                value={mutedAudio}
                onChange={(value) => dispatch(changeJoinAudioMuted(value))}
                containerStyle={styles.switchContainer}
              />

              <SwitchRow
                text="Join with Muted Video"
                value={mutedVideo}
                onChange={(value) => dispatch(changeJoinVideoMuted(value))}
                containerStyle={styles.switchContainer}
              />

              <SwitchRow
                text="Skip Preview"
                value={skipPreview}
                onChange={(value) => dispatch(changeJoinSkipPreview(value))}
                containerStyle={styles.switchContainer}
              />

              {Platform.OS === 'ios' ? (
                <SwitchRow
                  text="Music Mode"
                  value={musicMode}
                  onChange={(value) => dispatch(changeMusicMode(value))}
                  containerStyle={styles.switchContainer}
                />
              ) : null}

              {Platform.OS === 'ios' ? (
                <SwitchRow
                  text="Audio Mixer"
                  value={audioMixer}
                  onChange={(value) => dispatch(changeAudioMixer(value))}
                  containerStyle={styles.switchContainer}
                />
              ) : null}

              {Platform.OS === 'android' ? (
                <SwitchRow
                  text="Software Decoder"
                  value={softwareDecoder}
                  onChange={(value) => dispatch(changeSoftwareDecoder(value))}
                  containerStyle={styles.switchContainer}
                />
              ) : null}

              {Platform.OS === 'android' ? (
                <SwitchRow
                  text="Auto Resize"
                  value={autoResize}
                  onChange={(value) => dispatch(changeAutoResize(value))}
                  containerStyle={styles.switchContainer}
                />
              ) : null}

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => dispatch(resetJoinConfig())}
              >
                <Text style={styles.resetText}>Reset to Defaults</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* <View style={styles.flexSpace} /> */}

        {debugMode ? (
          <>
            <View style={styles.divider} />

            <View>
              <Text style={styles.versionText}>
                App Version{' '}
                <Text style={styles.versionNumber}>
                  {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
                </Text>
              </Text>

              <Text style={styles.versionText}>
                React Native SDK{' '}
                <Text style={styles.versionNumber}>{hmsRNSdkVersion}</Text>
              </Text>

              <Text style={styles.versionText}>
                React Native Room Kit{' '}
                <Text style={styles.versionNumber}>{hmsRoomKitVersion}</Text>
              </Text>

              <Text style={styles.versionText}>
                100ms{' '}
                {Platform.select({
                  ios: 'iOS',
                  android: 'Android',
                  default: '-',
                })}{' '}
                SDK{' '}
                <Text style={styles.versionNumber}>
                  {Platform.select({
                    android: hmsAndroidSdkVersion,
                    ios: hmsIOSSdkVersion,
                    default: '-',
                  })}
                </Text>
              </Text>
            </View>

            <View style={styles.divider} />
          </>
        ) : null}

        <Text style={styles.footer}>Made with ❤️ by 100ms</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginVertical: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
  },
  icon: {
    color: COLORS.WHITE,
    marginRight: 16,
  },
  switchContainer: {
    marginVertical: 12,
  },
  flexSpace: {
    flex: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  resetText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.INDICATORS.WARNING,
  },
  resetIcon: {
    color: COLORS.INDICATORS.WARNING,
    marginRight: 4,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
  versionNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  footer: {
    marginTop: 8,
    marginBottom: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    textAlign: 'center',
  },
});
