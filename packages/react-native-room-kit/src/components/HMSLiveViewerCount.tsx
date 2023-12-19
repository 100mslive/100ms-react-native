import * as React from 'react';
import { StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { HMSStreamingState } from '@100mslive/react-native-hms';

import {
  useHMSRoomStyleSheet,
  useIsHLSViewer,
  useShowChatAndParticipants,
} from '../hooks-util';
import { EyeIcon } from '../Icons';
import { hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import { TestIds } from '../utils/constants';

const _HMSLiveViewerCount = () => {
  const isHLSViewer = useIsHLSViewer();
  const previewPeerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const live = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.hlsStreamingState?.state ===
      HMSStreamingState.STARTED
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typograhy) => ({
    viewers: {
      backgroundColor: isHLSViewer
        ? theme.palette.background_dim &&
          hexToRgbA(theme.palette.background_dim, 0.64)
        : undefined,
      borderWidth: isHLSViewer ? 0 : 1,
      borderColor: theme.palette.border_bright,
    },
    count: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
  }));

  const { canShowParticipants, show } = useShowChatAndParticipants();

  const showParticipantsSheet = () => {
    show('participants');
  };

  if (!live || typeof previewPeerCount !== 'number') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.viewers, hmsRoomStyles.viewers]}
      onPress={showParticipantsSheet}
      disabled={!canShowParticipants}
    >
      <EyeIcon testID={TestIds.peer_count_icon} />

      <Text
        testID={TestIds.peer_count}
        style={[styles.count, hmsRoomStyles.count]}
      >
        {previewPeerCount}
      </Text>
    </TouchableOpacity>
  );
};

export const HMSLiveViewerCount = React.memo(_HMSLiveViewerCount);

const styles = StyleSheet.create({
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    paddingLeft: 6,
    borderRadius: 4,
  },
  count: {
    fontSize: 10,
    lineHeight: Platform.OS === 'android' ? 16 : undefined,
    letterSpacing: 1.5,
    textAlign: 'center',
    textAlignVertical: 'center',

    marginLeft: 4,
  },
});
