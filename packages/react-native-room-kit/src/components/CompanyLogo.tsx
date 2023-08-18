import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSLayoutConfig } from '../hooks-util';

interface CompanyLogoProps extends Omit<ImageProps, 'source'> {}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  style,
  ...restProps
}) => {
  const layoutConfig = useHMSLayoutConfig();

  const logoSource = layoutConfig?.logo?.url;
  if (!logoSource) {
    return null;
  }

  return (
    <Image
      source={{ uri: logoSource }}
      style={[styles.icon, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    height: 32,
    resizeMode: 'contain',
  },
});
