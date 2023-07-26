import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Image } from 'react-native';

import type { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { CustomButton } from './CustomButton';
import { useHMSInstance } from '../hooks-util';

export const HMSShowNetworkQuality = () => {
  const hmsInstance = useHMSInstance();
  const localPeerDownlinkNetworkQuality = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.networkQuality?.downlinkQuality
  );

  useEffect(() => {
    hmsInstance.enableNetworkQualityUpdates();

    return () => hmsInstance.disableNetworkQualityUpdates();
  }, [hmsInstance]);

  return (
    <CustomButton
      onPress={() => {}}
      disabled={true}
      viewStyle={styles.singleIconContainer}
      LeftIcon={
        <Image
          resizeMode="contain"
          style={styles.image}
          source={
            localPeerDownlinkNetworkQuality === 0
              ? require('../assets/network_0.png')
              : localPeerDownlinkNetworkQuality === 1
              ? require('../assets/network_1.png')
              : localPeerDownlinkNetworkQuality === 2
              ? require('../assets/network_2.png')
              : localPeerDownlinkNetworkQuality === 3
              ? require('../assets/network_3.png')
              : require('../assets/network_4.png')
          }
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  image: {
    height: 32,
    width: 32,
  },
  singleIconContainer: {
    padding: 8,
    backgroundColor: COLORS.BORDER.LIGHT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: 'auto',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
});
