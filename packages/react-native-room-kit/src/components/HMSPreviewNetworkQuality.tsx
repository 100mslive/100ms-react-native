import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { NetworkQualityIcon } from '../Icons';
import { COLORS } from '..//utils/theme';
import type { RootState } from '../redux';
import { useHMSInstance } from '../hooks-util';

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

  return (
    <View style={styles.container}>
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
    backgroundColor: COLORS.BACKGROUND.DIM_80,
    alignSelf: 'flex-start',
  },
});
