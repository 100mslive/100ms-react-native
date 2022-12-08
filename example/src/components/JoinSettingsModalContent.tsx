import React from 'react';
import DeviceInfo from 'react-native-device-info';
import { View, Text, StyleSheet, Platform } from 'react-native';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';

import { COLORS } from '../utils/theme';
import { version as hmsRNSdkVersion } from '../../../package.json';

interface JoinSettingsModalContentProps {}

export const JoinSettingsModalContent: React.FC<JoinSettingsModalContentProps> = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.versionText}>
          App {" "}
          <Text style={styles.versionNumber}>
            v{DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
          </Text>
        </Text>

        <Text style={styles.versionText}>
          100ms React Native SDK {" "}
          <Text style={styles.versionNumber}>v{hmsRNSdkVersion}</Text>
        </Text>

        <Text style={styles.versionText}>
          100ms {Platform.select({ ios: 'iOS', android: 'Android', default: '-' })} SDK {" "}
          <Text style={styles.versionNumber}>
            v ---
          </Text>
        </Text>
      </View>

      <Text style={styles.footer}>Made with <FontAwesomeIcons name='heart' size={16} /> by 100ms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  versionNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.TWIN.ORANGE,
  },
  footer: {
    marginTop: 32,
    marginBottom: 24,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    textAlign: 'center'
  }
});
