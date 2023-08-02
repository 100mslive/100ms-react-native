import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../utils/theme';

export interface HMSPreviewTitleProps {
  title?: string;
}

export const HMSPreviewTitle: React.FC<HMSPreviewTitleProps> = ({
  title = 'Get Started',
}) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 32,
    textAlign: 'center',
  },
});
