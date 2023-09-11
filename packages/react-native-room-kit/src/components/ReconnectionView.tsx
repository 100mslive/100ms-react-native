import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { BlurView } from '@react-native-community/blur';

import type { RootState } from '../redux';
import { AlertTriangleIcon } from '../Icons';
import { useHMSRoomStyleSheet } from '../hooks-util';

export const _ReconnectionView: React.FC = () => {
  const reconnecting = useSelector(
    (state: RootState) => state.hmsStates.reconnecting
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    degradedText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    icon: {
      tintColor: theme.palette.on_surface_high,
    },
  }));

  if (!reconnecting) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurRadius={25}
        blurAmount={Platform.OS === 'ios' ? 4 : 32}
        downsampleFactor={25}
      />

      <AlertTriangleIcon
        type="fill"
        style={[styles.icon, hmsRoomStyles.icon]}
      />

      <Text
        numberOfLines={2}
        style={[styles.degradedText, hmsRoomStyles.degradedText]}
      >
        Your network is unstable
      </Text>
    </View>
  );
};

export const ReconnectionView = React.memo(_ReconnectionView);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 32,
    height: 32,
  },
  degradedText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
