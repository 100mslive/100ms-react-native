import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HMSTrackSource } from '@100mslive/react-native-hms';

import { hexToRgbA } from '../../utils/theme';
import { NetworkQualityIcon } from '../../Icons';
import { useHMSRoomStyleSheet } from '../../hooks-util';

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
  const showTrackSource = trackSource && trackSource !== HMSTrackSource.REGULAR;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    contentContainer: {
      backgroundColor: hexToRgbA(theme.palette.background_dim, 0.64),
    },
    name: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, hmsRoomStyles.contentContainer]}>
        <Text
          style={[styles.name, hmsRoomStyles.name]}
          numberOfLines={1}
          ellipsizeMode={showTrackSource ? 'middle' : 'tail'}
        >
          {name}
          {isLocal ? ' (You)' : ''}
          {showTrackSource ? `'s ${trackSource}` : ''}
        </Text>

        <NetworkQualityIcon
          quality={networkQuality}
          style={styles.networkIcon}
        />
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
    borderRadius: 8,
    marginLeft: 8, // left offset
    marginRight: 20 + 4 + 44, // network icon width + network icon left margin + 3 dots button width and horizontal margins
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  networkIcon: {
    marginLeft: 4,
  },
});
