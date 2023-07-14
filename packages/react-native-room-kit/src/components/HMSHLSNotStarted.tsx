import * as React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';

import { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { usePortraitChatViewVisible } from '../hooks-util';
import { ClockIcon } from '../Icons';

export const HMSHLSNotStarted = () => {
  const portraitChatViewVisible = usePortraitChatViewVisible();
  const hlsAspectRatio = useSelector(
    (state: RootState) => state.app.hlsAspectRatio
  );

  return (
    <View
      style={[
        styles.textContainer,
        portraitChatViewVisible ? styles.taleLessSpaceAsYouCan : null,
        portraitChatViewVisible ? { aspectRatio: hlsAspectRatio.value } : null,
      ]}
    >
      <ClockIcon />
      <Text style={styles.title}>Class hasn't started yet</Text>
      <Text style={styles.description}>
        Please wait for the teacher to start the class.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  description: {
    color: COLORS.SURFACE.ON_SURFACE.LOW,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
    marginTop: 8,
  },
  taleLessSpaceAsYouCan: {
    flex: 0,
  },
});
