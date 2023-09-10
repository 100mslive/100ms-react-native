import * as React from 'react';
import { StyleSheet, View } from 'react-native';

type OverlayContainerProps = {};

export const OverlayContainer: React.FC<OverlayContainerProps> & {
  Overlay: typeof Overlay;
} = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

type OverlayProps = {};

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  return <View style={styles.absoluteContainer}>{children}</View>;
};

OverlayContainer.Overlay = Overlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 1,
  },
});
