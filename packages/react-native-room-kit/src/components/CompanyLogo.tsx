import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ImageProps } from 'react-native';

import { useHMSLayoutConfig } from '../hooks-util';
import { TestIds } from '../utils/constants';

interface CompanyLogoProps extends Omit<ImageProps, 'source'> {}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  style,
  ...restProps
}) => {
  const logoSource = useHMSLayoutConfig(
    (layoutConfig) => layoutConfig?.logo?.url
  );

  if (!logoSource) {
    return null;
  }

  return (
    <Image
      testID={TestIds.company_logo}
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
