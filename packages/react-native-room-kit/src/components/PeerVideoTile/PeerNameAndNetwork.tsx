import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HMSTrackSource } from '@100mslive/react-native-hms';

import { COLORS } from '../../utils/theme';
import { NetworkQualityIcon } from '../../Icons';

export interface PeerNameAndNetworkProps {
  name: string;
  isLocal: boolean | undefined;
  trackSource: HMSTrackSource | undefined;
  networkQuality: number | undefined;
}

export const PeerNameAndNetwork: React.FC<PeerNameAndNetworkProps> = ({
  name,
  isLocal,
  trackSource,
  networkQuality,
}) => {
  const showTrackSource = trackSource && (trackSource !== HMSTrackSource.REGULAR);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode={showTrackSource ? 'middle' : 'tail'}>
          {name}
          {isLocal ? ' (You)' : ''}
          {showTrackSource ? `'s ${trackSource}` : ''}
        </Text>

        <NetworkQualityIcon quality={networkQuality} style={styles.networkIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.BACKGROUND.DIM_64,
    borderRadius: 8,
    marginLeft: 8, // left offset
    marginRight: 20 + 4 + 44, // network icon width + network icon left margin + 3 dots button width and horizontal margins
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
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
