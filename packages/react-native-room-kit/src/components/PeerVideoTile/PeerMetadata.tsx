import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { parseMetadata } from '../../utils/functions';
import { BRBIcon, HandIcon } from '../../Icons';
import { COLORS } from '../../utils/theme';

export interface PeerMetadataProps {
  metadata: string | undefined;
}

export const PeerMetadata: React.FC<PeerMetadataProps> = ({ metadata }) => {
  const parsedMetadata = parseMetadata(metadata)
  
  if (parsedMetadata.isBRBOn) {
    return (
      <View style={styles.iconWrapper}>
        <BRBIcon />
      </View>
    );
  }

  if (parsedMetadata.isHandRaised) {
    return (
      <View style={styles.iconWrapper}>
        <HandIcon />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4,
    backgroundColor: COLORS.SECONDARY.DIM,
    borderRadius: 16
  }
});
