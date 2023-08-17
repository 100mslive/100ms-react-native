import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { parseMetadata } from '../../utils/functions';
import { BRBIcon, HandIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';

export interface PeerMetadataProps {
  metadata: string | undefined;
}

export const PeerMetadata: React.FC<PeerMetadataProps> = ({ metadata }) => {
  const parsedMetadata = parseMetadata(metadata);

  const iconWrapperStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.secondary_dim,
  }));

  if (parsedMetadata.isBRBOn) {
    return (
      <View style={[styles.iconWrapper, iconWrapperStyles]}>
        <BRBIcon />
      </View>
    );
  }

  if (parsedMetadata.isHandRaised) {
    return (
      <View style={[styles.iconWrapper, iconWrapperStyles]}>
        <HandIcon />
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
