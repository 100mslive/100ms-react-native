import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../utils/theme';
import { NetworkQualityIcon } from '../../Icons';

export interface PeerNameAndNetworkProps {
  name: string;
  isLocal: boolean | undefined;
  networkQuality: number | undefined;
}

export const PeerNameAndNetwork: React.FC<PeerNameAndNetworkProps> = ({
  name,
  isLocal,
  networkQuality,
}) => {
  return (
    <View style={styles.container}>
      <View style={{ }}>
        <Text style={styles.name} numberOfLines={1}>
          {name}{isLocal ? ' (You)' : ''}
        </Text>
      </View>

      <NetworkQualityIcon quality={networkQuality} style={styles.networkIcon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    // flexBasis: '70%',
    // maxWidth: '70%',
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.BACKGROUND.DIM_64,
    borderRadius: 8,
  },
  name: {
    flex: 1,
    flexGrow: 1,
    // flexShrink: 1,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  networkIcon: {
    marginLeft: 4
  }
});
