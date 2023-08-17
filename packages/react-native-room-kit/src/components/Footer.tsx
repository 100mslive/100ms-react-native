import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { COLORS } from '../utils/theme';
import { useIsHLSViewer } from '../hooks-util';
import { HMSManageLeave } from './HMSManageLeave';
import { HMSManageRaiseHand } from './HMSManageRaiseHand';
import { HMSManageLocalAudio } from './HMSManageLocalAudio';
import { HMSManageLocalVideo } from './HMSManageLocalVideo';
import { HMSChat } from './HMSChat';
import { HMSRoomOptions } from './HMSRoomOptions';
import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';

interface FooterProps {
  offset: SharedValue<number>;
}

export const _Footer: React.FC<FooterProps> = ({ offset }) => {
  const isHLSViewer = useIsHLSViewer();
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  const footerActionButtons = useMemo(() => {
    const actions = ['chat', 'options'];

    if (isHLSViewer) {
      actions.unshift('hand-raise');
    }

    if (canPublishVideo) {
      actions.unshift('video');
    }

    if (canPublishAudio) {
      actions.unshift('audio');
    }

    actions.unshift('leave');

    return actions;
  }, [isHLSViewer, canPublishAudio, canPublishVideo]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(offset.value, [0, 0.7, 1], [0, 0.5, 1]),
      transform: [{ translateY: interpolate(offset.value, [0, 1], [10, 0]) }],
    };
  }, []);

  const animatedProps = useAnimatedProps((): {
    pointerEvents: 'none' | 'auto';
  } => {
    return {
      pointerEvents: offset.value === 0 ? 'none' : 'auto',
    };
  }, []);

  return (
    <Animated.View style={animatedStyles} animatedProps={animatedProps}>
      <View style={styles.container}>
        {footerActionButtons.map((actionType, index) => {
          return (
            <View
              key={actionType}
              style={index === 0 ? null : styles.iconWrapper}
            >
              {actionType === 'leave' ? (
                <HMSManageLeave />
              ) : actionType === 'audio' ? (
                <HMSManageLocalAudio />
              ) : actionType === 'video' ? (
                <HMSManageLocalVideo />
              ) : actionType === 'chat' ? (
                <HMSChat />
              ) : actionType === 'options' ? (
                <HMSRoomOptions />
              ) : actionType === 'hand-raise' ? (
                <HMSManageRaiseHand />
              ) : null}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND.DIM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'android' ? 16 : 0, // TODO: need to correct hide aimation offsets because of this change
  },
  iconWrapper: {
    marginLeft: 24,
  },
});

export const Footer = memo(_Footer);
