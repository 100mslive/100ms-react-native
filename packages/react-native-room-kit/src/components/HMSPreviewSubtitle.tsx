import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../utils/theme';
import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';

export interface HMSPreviewSubtitleProps {
  subtitle?: string;
}

export const HMSPreviewSubtitle: React.FC<HMSPreviewSubtitleProps> = ({
  subtitle,
}) => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  if (subtitle) {
    return <Text style={styles.title}>{subtitle}</Text>;
  }

  if (canPublishAudio && canPublishVideo) {
    return (
      <Text style={styles.title}>
        Setup your audio and video before joining
      </Text>
    );
  }

  if (canPublishAudio) {
    return <Text style={styles.title}>Setup your audio before joining</Text>;
  }

  if (canPublishVideo) {
    return <Text style={styles.title}>Setup your video before joining</Text>;
  }

  return <Text style={styles.title}>Enter your name before joining</Text>;
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.SURFACE.ON_SURFACE.MEDIUM,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
});
