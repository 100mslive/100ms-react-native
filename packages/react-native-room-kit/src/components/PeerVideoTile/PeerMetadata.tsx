import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { parseMetadata } from '../../utils/functions';
import { BRBIcon, HandIcon } from '../../Icons';
import { useHMSRoomStyleSheet } from '../../hooks-util';

export interface PeerMetadataProps {
  metadata: string | undefined;
  isHandRaised: boolean;
}

export const PeerMetadata: React.FC<PeerMetadataProps> = ({
  metadata,
  isHandRaised,
}) => {
  const isBRBOn = !!parseMetadata(metadata).isBRBOn;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    iconWrapper: {
      backgroundColor: theme.palette.secondary_dim,
    },
    icon: {
      tintColor: theme.palette.on_secondary_high,
    },
  }));

  if (isBRBOn) {
    return (
      <View style={[styles.iconWrapper, hmsRoomStyles.iconWrapper]}>
        <BRBIcon style={hmsRoomStyles.icon} />
      </View>
    );
  }

  if (isHandRaised) {
    return (
      <View style={[styles.iconWrapper, hmsRoomStyles.iconWrapper]}>
        <HandIcon style={hmsRoomStyles.icon} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4,
    borderRadius: 16,
  },
});
