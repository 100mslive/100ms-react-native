import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSVideoViewMode } from '@100mslive/react-native-hms';
import type { HMSViewProps } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { useHMSInstance } from '../hooks-util';

export interface HMSVideoViewProps extends Omit<HMSViewProps, 'id'> {}

export const HMSVideoView: React.FC<HMSVideoViewProps> = ({
  trackId,
  style,
  ...restProps
}) => {
  const hmsInstance = useHMSInstance();
  const HmsView = hmsInstance.HmsView;
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast
  );

  return (
    <HmsView
      {...restProps}
      trackId={trackId}
      key={trackId}
      mirror={restProps.mirror ?? mirrorCamera}
      autoSimulcast={restProps.autoSimulcast ?? autoSimulcast}
      scaleType={restProps.scaleType ?? HMSVideoViewMode.ASPECT_FILL}
      style={{ ...styles.hmsView, ...style }}
    />
  );
};

const styles = StyleSheet.create({
  hmsView: {
    flex: 1,
  },
});
