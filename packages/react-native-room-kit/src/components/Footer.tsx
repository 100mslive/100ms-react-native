import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHMSRoomStyle, useIsHLSViewer } from '../hooks-util';
import { HMSManageLeave } from './HMSManageLeave';
import { HMSManageRaiseHand } from './HMSManageRaiseHand';
import { HMSManageLocalAudio } from './HMSManageLocalAudio';
import { HMSManageLocalVideo } from './HMSManageLocalVideo';
import { HMSChat } from './HMSChat';
import { HMSRoomOptions } from './HMSRoomOptions';
import { useCanPublishAudio, useCanPublishVideo } from '../hooks-sdk';

interface FooterProps {}

export const _Footer: React.FC<FooterProps> = () => {
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

  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  return (
    <SafeAreaView
      style={isHLSViewer ? null : containerStyles}
      edges={['bottom']}
    >
      <View
        style={[
          styles.container,
          isHLSViewer ? styles.hlsContainer : containerStyles,
        ]}
      >
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'android' ? 16 : 0, // TODO: need to correct hide aimation offsets because of this change
  },
  hlsContainer: {
    paddingTop: 8,
  },
  iconWrapper: {
    marginLeft: 24,
  },
});

export const Footer = memo(_Footer);
