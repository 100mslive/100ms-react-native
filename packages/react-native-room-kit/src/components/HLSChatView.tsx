import * as React from 'react';
import { View } from 'react-native';

import { useHLSViewsConstraints, useHMSRoomStyleSheet } from '../hooks-util';
import { HLSChatHeaderView } from './HLSChatHeaderView';
import { HLSChatFooterView } from './HLSChatFooterView';
import { HLSChatMessages } from './HLSChatMessages';
import { HLSDescriptionPane } from './HLSDescriptionPane';
import { useIsLandscapeOrientation } from '../utils/dimension';

export const HLSChatView = () => {
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const { chatWrapperConstraints } = useHLSViewsConstraints();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    wrapper: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

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
      <View style={[{ flex: 1 }, hmsRoomStyles.wrapper]}>
        {isLandscapeOrientation ? null : <HLSChatHeaderView />}

        <HLSChatMessages />

        <HLSChatFooterView />

        {/* Below is absolute positioned and only visible when state is true */}
        {isLandscapeOrientation ? null : <HLSDescriptionPane />}
      </View>
    </View>
  );
};
