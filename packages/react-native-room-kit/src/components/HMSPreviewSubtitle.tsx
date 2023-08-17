import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';
import { useHMSRoomStyle } from '../hooks-util';
import type { RootState } from '../redux';

export interface HMSPreviewSubtitleProps {
  subtitle?: string;
}

export const HMSPreviewSubtitle: React.FC<HMSPreviewSubtitleProps> = ({
  subtitle,
}) => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  const hmsRoomPreviewSubtitle = useSelector((state: RootState) => {
    const layoutConfig = state.hmsStates.layoutConfig;

    return layoutConfig?.screens?.preview?.default?.elements?.preview_header
      ?.sub_title;
  });

  const titleStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_medium,
    fontFamily: `${typography.font_family}-Regular`,
  }));

  const textStyles: StyleProp<TextStyle> = [styles.title, titleStyles];

  if (subtitle) {
    return <Text style={textStyles}>{subtitle}</Text>;
  }

  if (hmsRoomPreviewSubtitle) {
    return <Text style={textStyles}>{hmsRoomPreviewSubtitle}</Text>;
  }

  if (canPublishAudio && canPublishVideo) {
    return (
      <Text style={textStyles}>Setup your audio and video before joining</Text>
    );
  }

  if (canPublishAudio) {
    return <Text style={textStyles}>Setup your audio before joining</Text>;
  }

  if (canPublishVideo) {
    return <Text style={textStyles}>Setup your video before joining</Text>;
  }

  return <Text style={textStyles}>Enter your name before joining</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
});
