import * as React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { useHLSViewsConstraints, useHMSRoomStyleSheet } from '../hooks-util';
import { HLSChatHeaderView } from './HLSChatHeaderView';
import { HLSChatFooterView } from './HLSChatFooterView';
import { HLSChatMessages } from './HLSChatMessages';
import { HLSDescriptionPane } from './HLSDescriptionPane';
import { useIsLandscapeOrientation } from '../utils/dimension';
import type { RootState } from '../redux';
import { HLSNotifications } from './HLSNotifications';
import { PipModes } from '../utils/types';

export const HLSChatView = () => {
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const { chatWrapperConstraints } = useHLSViewsConstraints();
  const fullScreenMode = useSelector((state: RootState) => {
    const hlsFullScreen = state.app.hlsFullScreen;
    const isPipModeActive = state.app.pipModeStatus === PipModes.ACTIVE;
    return hlsFullScreen || isPipModeActive;
  });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    wrapper: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  if (fullScreenMode) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: isLandscapeOrientation ? undefined : 0,
        right: 0,
        width: chatWrapperConstraints.width,
        height: chatWrapperConstraints.height,
      }}
    >
      <View style={[{ flex: 1, position: 'relative' }, hmsRoomStyles.wrapper]}>
        {isLandscapeOrientation ? null : <HLSChatHeaderView />}

        <HLSChatMessages />

        <HLSChatFooterView />

        <HLSNotifications />

        {/* Below is absolute positioned and only visible when state is true */}
        {isLandscapeOrientation ? null : <HLSDescriptionPane />}
      </View>
    </View>
  );
};
