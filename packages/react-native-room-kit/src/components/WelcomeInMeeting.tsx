import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

export interface WelcomeInMeetingProps {}

export const WelcomeInMeeting: React.FC<WelcomeInMeetingProps> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    heading: {
      fontFamily: `${typography.font_family}-Bold`,
      color: theme.palette.on_surface_high,
    },
    description: {
      fontFamily: `${typography.font_family}-Medium`,
      color: theme.palette.on_surface_medium,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, hmsRoomStyles.heading]}>Welcome!</Text>
      <Text style={[styles.description, hmsRoomStyles.description]}>
        You're the first one here.
      </Text>
      <Text style={[styles.description, hmsRoomStyles.description]}>
        Sit back and relax till the others join.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.1,
    textAlign: 'center',
    paddingBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    textAlign: 'center',
  }
});
