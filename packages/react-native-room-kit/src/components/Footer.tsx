import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useHMSLayoutConfig,
  useHMSRoomStyle,
  useIsHLSViewer,
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
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';

interface FooterProps {}

export const _Footer: React.FC<FooterProps> = () => {
  const isHLSViewer = useIsHLSViewer();
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();
  const canPublishScreen = useCanPublishScreen();

  const isViewer = !(canPublishAudio || canPublishVideo || canPublishScreen);

  const { canShowParticipants, canShowChat } = useShowChatAndParticipants();

  const canShowBRB = useHMSLayoutConfig(
    (layoutConfig) =>
      !!layoutConfig?.screens?.conferencing?.default?.elements?.brb
  );

  const isOnStage = useHMSLayoutConfig((layoutConfig) => {
    return !!layoutConfig?.screens?.conferencing?.default?.elements
      ?.on_stage_exp;
  });

  const canStartRecording = useSelector(
    (state: RootState) =>
      !!state.hmsStates.localPeer?.role?.permissions?.browserRecording
  );

  const canShowOptions =
    isViewer ||
    canPublishScreen ||
    canShowParticipants ||
    canShowBRB ||
    canStartRecording;

  const footerActionButtons = useMemo(() => {
    const actions = [];

    if (canShowChat) {
      actions.push('chat');
    }

    if (!isOnStage && isViewer) {
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
    isOnStage,
    canShowOptions,
    canShowChat,
    isViewer,
    canPublishAudio,
    canPublishVideo,
  ]);

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

export const useFooterHeight = (excludeSafeArea: boolean = false) => {
  const isHLSViewer = useIsHLSViewer();
  const { bottom } = useSafeAreaInsets();

  return (
    (excludeSafeArea ? 0 : bottom) +
    (isHLSViewer ? 8 : 16) +
    (Platform.OS === 'android' ? 16 : 0) +
    40
  ); // bottomSafeArea + paddingTop + marginBottom + content
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
  hlsContainer: {
    paddingTop: 8,
  },
  iconWrapper: {
    marginLeft: 24,
  },
});

export const Footer = memo(_Footer);
