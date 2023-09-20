import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { parseMetadata } from '../../utils/functions';
import { BRBIcon, HandIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';

export interface PeerMetadataProps {
  metadata: string | undefined;
  isHandRaised: boolean;
}

export const PeerMetadata: React.FC<PeerMetadataProps> = ({
  metadata,
  isHandRaised,
}) => {
  const isBRBOn = !!parseMetadata(metadata).isBRBOn;

  const iconWrapperStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.secondary_dim,
  }));

  if (isBRBOn) {
    return (
      <View style={[styles.iconWrapper, iconWrapperStyles]}>
        <BRBIcon />
      </View>
    );
  }

  if (isHandRaised) {
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
