import * as React from 'react';
import { StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
} from '../hooks-util';
import { EyeIcon } from '../Icons';
import type { RootState } from '../redux';
import { TestIds } from '../utils/constants';
import { useIsAnyStreamingOn } from '../hooks-sdk';

const _HMSLiveViewerCount = () => {
  const previewPeerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const live = useIsAnyStreamingOn();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typograhy) => ({
    viewers: {
      backgroundColor: undefined,
      borderWidth: 1,
      borderColor: theme.palette.border_bright,
    },
    count: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typograhy.font_family}-SemiBold`,
    },
  }));

  const { canShowParticipants, show } = useShowChatAndParticipants();

  const tapGesture = React.useMemo(() => Gesture.Tap(), []);

  const showParticipantsSheet = () => {
    show('participants');
  };

  if (!live || typeof previewPeerCount !== 'number') {
    return null;
  }

  return (
    <GestureDetector gesture={tapGesture}>
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
    </GestureDetector>
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
