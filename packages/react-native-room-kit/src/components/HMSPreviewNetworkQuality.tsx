import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { NetworkQualityIcon } from '../Icons';
import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import { useHMSInstance, useHMSRoomStyle } from '../hooks-util';

export const HMSPreviewNetworkQuality = () => {
  const hmsInstance = useHMSInstance();
  const localPeerNetworkQuality = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.networkQuality?.downlinkQuality
  );

  React.useEffect(() => {
    hmsInstance.enableNetworkQualityUpdates();

    return () => hmsInstance.disableNetworkQualityUpdates();
  }, []);

  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor:
      theme.palette.background_dim &&
      hexToRgbA(theme.palette.background_dim, 0.8),
  }));

  return (
    <View style={[styles.container, containerStyles]}>
      <NetworkQualityIcon quality={localPeerNetworkQuality} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
});
