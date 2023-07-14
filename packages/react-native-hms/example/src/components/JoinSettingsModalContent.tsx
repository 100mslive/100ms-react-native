import React from 'react';
import DeviceInfo from 'react-native-device-info';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';

import {COLORS} from '../utils/theme';
import {version as hmsRNSdkVersion} from '../../../package.json';
import {
  ios as hmsIOSSdkVersion,
  android as hmsAndroidSdkVersion,
} from '../../../sdk-versions.json';
import {SwitchRow} from './SwitchRow';
import {RootState} from '../redux';
import {
  changeAudioMixer,
  changeShowStats,
  changeJoinAudioMuted,
  changeJoinSkipPreview,
  changeJoinVideoMuted,
  changeMirrorCamera,
  changeSoftwareDecoder,
  changeAutoResize,
  changeAutoSimulcast,
  resetJoinConfig,
  changeMusicMode,
  changeShowHLSStats,
} from '../redux/actions';

interface JoinSettingsModalContentProps {}

export const JoinSettingsModalContent: React.FC<
  JoinSettingsModalContentProps
> = () => {
  const dispatch = useDispatch();
  const joinConfig = useSelector((state: RootState) => state.app.joinConfig);
  const {
    mutedAudio,
    mutedVideo,
    skipPreview,
    mirrorCamera,
    showStats,
    showHLSStats,
    audioMixer,
    musicMode,
    softwareDecoder,
    autoResize,
    autoSimulcast,
  } = joinConfig;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Room Settings</Text>

      <View style={styles.divider} />

      <ScrollView>
        <View>
          <SwitchRow
            text="Join with Muted Audio"
            value={mutedAudio}
            onChange={value => dispatch(changeJoinAudioMuted(value))}
            LeftIcon={
              <IoniconsIcons name="mic-outline" size={24} style={styles.icon} />
            }
            containerStyle={styles.switchContainer}
          />

          <SwitchRow
            text="Join with Muted Video"
            value={mutedVideo}
            onChange={value => dispatch(changeJoinVideoMuted(value))}
            LeftIcon={
              <MaterialCommunityIcons
                name="video-off-outline"
                size={24}
                style={styles.icon}
              />
            }
            containerStyle={styles.switchContainer}
          />

          <SwitchRow
            text="Mirror Camera"
            value={mirrorCamera}
            onChange={value => dispatch(changeMirrorCamera(value))}
            LeftIcon={
              <IoniconsIcons
                name="camera-reverse-outline"
                size={24}
                style={styles.icon}
              />
            }
            containerStyle={styles.switchContainer}
          />

          <SwitchRow
            text="Skip Preview"
            value={skipPreview}
            onChange={value => dispatch(changeJoinSkipPreview(value))}
            LeftIcon={
              <IoniconsIcons name="eye-outline" size={24} style={styles.icon} />
            }
            containerStyle={styles.switchContainer}
          />

          {Platform.OS === 'ios' ? (
            <SwitchRow
              text="Music Mode"
              value={musicMode}
              onChange={value => dispatch(changeMusicMode(value))}
              LeftIcon={
                <IoniconsIcons
                  name="ios-musical-notes-outline"
                  size={24}
                  style={styles.icon}
                />
              }
              containerStyle={styles.switchContainer}
            />
          ) : null}

          {Platform.OS === 'ios' ? (
            <SwitchRow
              text="Audio Mixer"
              value={audioMixer}
              onChange={value => dispatch(changeAudioMixer(value))}
              LeftIcon={
                <EntypoIcons name="sound-mix" size={24} style={styles.icon} />
              }
              containerStyle={styles.switchContainer}
            />
          ) : null}

          {Platform.OS === 'android' ? (
            <SwitchRow
              text="Software Decoder"
              value={softwareDecoder}
              onChange={value => dispatch(changeSoftwareDecoder(value))}
              LeftIcon={
                <IoniconsIcons
                  name="settings-outline"
                  size={24}
                  style={styles.icon}
                />
              }
              containerStyle={styles.switchContainer}
            />
          ) : null}

          {Platform.OS === 'android' ? (
            <SwitchRow
              text="Auto Resize"
              value={autoResize}
              onChange={value => dispatch(changeAutoResize(value))}
              LeftIcon={
                <IoniconsIcons name="resize" size={24} style={styles.icon} />
              }
              containerStyle={styles.switchContainer}
            />
          ) : null}

          <SwitchRow
            text="Auto Simulcast"
            value={autoSimulcast}
            onChange={value => dispatch(changeAutoSimulcast(value))}
            LeftIcon={
              <MaterialIcons
                name="auto-awesome-motion"
                size={24}
                style={styles.icon}
              />
            }
            containerStyle={styles.switchContainer}
          />

          <SwitchRow
            text="Show RTC Stats"
            value={showStats}
            onChange={value => dispatch(changeShowStats(value))}
            LeftIcon={
              <MaterialCommunityIcons
                name="clipboard-pulse-outline"
                size={24}
                style={styles.icon}
              />
            }
            containerStyle={styles.switchContainer}
          />

          <SwitchRow
            text="Show HLS Stats"
            value={showHLSStats}
            onChange={value => dispatch(changeShowHLSStats(value))}
            LeftIcon={
              <MaterialCommunityIcons
                name="clipboard-pulse-outline"
                size={24}
                style={styles.icon}
              />
            }
            containerStyle={styles.switchContainer}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => dispatch(resetJoinConfig())}
          >
            <FontAwesomeIcons
              name="rotate-left"
              size={16}
              style={styles.resetIcon}
            />

            <Text style={styles.resetText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.flexSpace} /> */}

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
            100ms{' '}
            {Platform.select({ios: 'iOS', android: 'Android', default: '-'})}{' '}
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

        <Text style={styles.footer}>
          Made with <FontAwesomeIcons name="heart" size={16} color="red" /> by
          100ms
        </Text>
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
    // marginTop: 8,
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
    // marginTop: 8,
    // marginBottom: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    textAlign: 'center',
  },
});
