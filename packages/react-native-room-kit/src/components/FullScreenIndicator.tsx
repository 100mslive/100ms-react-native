import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { COLORS } from '../utils/theme';

export const FullScreenIndicator: React.FC = () => {
  return (
    <ActivityIndicator
      size={'large'}
      color={COLORS.PRIMARY.DEFAULT}
      style={styles.indicator}
    />
  );
};

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
  },
});
