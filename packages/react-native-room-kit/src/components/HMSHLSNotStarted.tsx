import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { RadioIcon } from '../Icons';

export const HMSHLSNotStarted = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    title: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    description: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <RadioIcon size="extra-large" containerStyle={styles.icon} />
      <Text style={[styles.title, hmsRoomStyles.title]}>
        Stream yet to start
      </Text>
      <Text style={[styles.description, hmsRoomStyles.description]}>
        Sit back and relax
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  taleLessSpaceAsYouCan: {
    flex: 0,
  },
});
