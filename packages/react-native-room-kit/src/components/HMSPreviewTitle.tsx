import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSelector } from 'react-redux';

import { useHMSRoomStyle } from '../hooks-util';
import type { RootState } from '../redux';

export interface HMSPreviewTitleProps {
  title?: string;
}

export const HMSPreviewTitle: React.FC<HMSPreviewTitleProps> = ({
  title = 'Get Started',
}) => {
  const hmsRoomPreviewTitle = useSelector((state: RootState) => {
    const layoutConfig = state.hmsStates.layoutConfig;

    const previewTitle = layoutConfig?.screens?.preview?.default?.elements?.preview_header?.title;

    return previewTitle || title;
  });

  const titleStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return <Text style={[styles.title, titleStyles]}>{hmsRoomPreviewTitle}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
});
