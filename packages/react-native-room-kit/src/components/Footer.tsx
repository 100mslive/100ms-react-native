import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useCanShowRoomOptionsButton,
  useHMSConferencingScreenConfig,
  useHMSLayoutConfig,
  useHMSRoomStyle,
  useShowChatAndParticipants,
} from '../hooks-util';
import { HMSManageLeave } from './HMSManageLeave';
import { HMSManageRaiseHand } from './HMSManageRaiseHand';
import { HMSManageLocalAudio } from './HMSManageLocalAudio';
import { HMSManageLocalVideo } from './HMSManageLocalVideo';
import { HMSChat } from './HMSChat';
import { HMSRoomOptions } from './HMSRoomOptions';
import {
  useCanPublishAudio,
  useCanPublishScreen,
  useCanPublishVideo,
} from '../hooks-sdk';

interface FooterProps {}

export const _Footer: React.FC<FooterProps> = () => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();
  const canPublishScreen = useCanPublishScreen();
  const canShowOptions = useCanShowRoomOptionsButton();
  const { canShowChat } = useShowChatAndParticipants();

  const isViewer = !(canPublishAudio || canPublishVideo || canPublishScreen);

  const isOnStage = useHMSLayoutConfig((layoutConfig) => {
    return !!layoutConfig?.screens?.conferencing?.default?.elements
      ?.on_stage_exp;
  });

  const canRaiseHand = useHMSConferencingScreenConfig(
    (confScreenConfig) => !!confScreenConfig?.elements?.hand_raise
  );

  const canShowHandRaiseInFooter = canRaiseHand && !isOnStage && isViewer;

  const footerActionButtons = useMemo(() => {
    const actions = [];

    if (canShowChat) {
      actions.push('chat');
    }

    if (canShowHandRaiseInFooter) {
      actions.unshift('hand-raise');
    }

    if (canPublishVideo) {
      actions.unshift('video');
    }

    if (canPublishAudio) {
      actions.unshift('audio');
    }

    actions.unshift('leave');

    if (canShowOptions) {
      actions.push('options');
    }

    return actions;
  }, [
    canShowHandRaiseInFooter,
    canShowOptions,
    canShowChat,
    canPublishAudio,
    canPublishVideo,
  ]);

  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_dim,
  }));

  return (
    <SafeAreaView style={containerStyles} edges={['bottom', 'left', 'right']}>
      <View style={[styles.container, containerStyles]}>
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

export const useFooterHeight = (excludeSafeArea: boolean = false) => {
  const { bottom } = useSafeAreaInsets();

  return (
    (excludeSafeArea ? 0 : bottom) + (Platform.OS === 'android' ? 16 : 0) + 40
  ); // bottomSafeArea + marginBottom + content
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'android' ? 16 : 0, // TODO: need to correct hide animation offsets because of this change
  },
  iconWrapper: {
    marginLeft: 24,
  },
});

export const Footer = memo(_Footer);
