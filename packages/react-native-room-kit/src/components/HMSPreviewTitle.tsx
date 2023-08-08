import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useHMSRoomStyle } from '../hooks-util';

export interface HMSPreviewTitleProps {
  title?: string;
}

export const HMSPreviewTitle: React.FC<HMSPreviewTitleProps> = ({
  title = 'Get Started',
}) => {
  const titleStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return <Text style={[styles.title, titleStyles]}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
});
