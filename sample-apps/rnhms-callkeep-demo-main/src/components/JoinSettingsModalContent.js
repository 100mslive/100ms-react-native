import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../utils/theme';
import { SwitchRow } from './SwitchRow';
import {
  changeJoinAudioMuted,
  changeJoinVideoMuted,
  changeMirrorCamera,
  resetJoinConfig,
} from '../redux/actions';

export const JoinSettingsModalContent = () => {
  const dispatch = useDispatch();
  const joinConfig = useSelector((state) => state.app.joinConfig);
  const {
    mutedAudio,
    mutedVideo,
    mirrorCamera,
  } = joinConfig;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Room Settings</Text>

      <View style={styles.divider} />

      <ScrollView>
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
      </ScrollView>

      <Text style={styles.footer}>
        Made with <FontAwesomeIcons name="heart" size={16} color="red" /> by
        100ms
      </Text>
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
    // marginTop: 8,
    marginBottom: 20,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    textAlign: 'center',
  },
});
