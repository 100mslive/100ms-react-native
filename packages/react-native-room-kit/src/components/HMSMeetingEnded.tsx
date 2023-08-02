import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../utils/theme';

export const HMSMeetingEnded = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meeting Ended</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 32,
  },
});
