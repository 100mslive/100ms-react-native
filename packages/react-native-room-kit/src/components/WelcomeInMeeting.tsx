import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { WelcomeHandIcon } from '../Icons';
import { useHMSRoomStyleSheet } from '../hooks-util';

export interface WelcomeInMeetingProps {}

export const WelcomeInMeeting: React.FC<WelcomeInMeetingProps> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    title: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    subtitle: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <WelcomeHandIcon />

      <Text style={[styles.title, hmsRoomStyles.title]}>Welcome!</Text>

      <Text style={[styles.subtitle, hmsRoomStyles.subtitle]}>
        Sit back and relax.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
