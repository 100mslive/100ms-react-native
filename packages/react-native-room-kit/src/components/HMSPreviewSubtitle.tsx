import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../utils/theme';

export interface HMSPreviewSubtitleProps {
  subtitle?: string;
}

export const HMSPreviewSubtitle: React.FC<HMSPreviewSubtitleProps> = ({
  subtitle = 'Setup your audio and video before joining',
}) => {
  return <Text style={styles.title}>{subtitle}</Text>;
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.SURFACE.ON_SURFACE.MEDIUM,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
});
