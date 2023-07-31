import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSVideoViewMode } from '@100mslive/react-native-hms';

import type { RootState } from '../redux';
import { useHMSInstance } from '../hooks-util';

export const HMSLocalVideoView = () => {
  const hmsInstance = useHMSInstance();
  const HmsView = hmsInstance.HmsView;
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast
  );
  const localVideoTrackId = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.videoTrack?.trackId
  );

  if (!localVideoTrackId) {
    return null;
  }

  return (
    <HmsView
      trackId={localVideoTrackId}
      key={localVideoTrackId}
      mirror={mirrorCamera}
      autoSimulcast={autoSimulcast}
      scaleType={HMSVideoViewMode.ASPECT_FILL}
      style={styles.hmsView}
    />
  );
};

const styles = StyleSheet.create({
  hmsView: {
    flex: 1,
  },
});
