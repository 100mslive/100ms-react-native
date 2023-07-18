import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PeerTrackNode } from '../utils/types';
import { useRTCStatsListeners } from '../utils/hooks';
import { COLORS } from '../utils/theme';
import {
  clearPendingModalTasks,
  useFetchHMSRoles,
  useHMSMessages,
  useHMSPIPRoomLeave,
  useHMSRemovedFromRoomUpdate,
  useLandscapeChatViewVisible,
  usePIPListener,
} from '../hooks-util';
import { ChatView } from './ChatWindow';
import { MeetingScreenContent } from './MeetingScreenContent';

interface MeetingProps {
  peerTrackNodes: Array<PeerTrackNode>;
}

export const Meeting: React.FC<MeetingProps> = ({ peerTrackNodes }) => {
  // TODO: Fetch latest Room and localPeer on mount of this component?

  useFetchHMSRoles();

  useHMSMessages();

  useHMSRemovedFromRoomUpdate();

  // Handle when user press leave button visible on PIP Window
  useHMSPIPRoomLeave();

  // Handle state change to reset layout when App is focused from PIP Window
  usePIPListener();

  // Handle rendering RTC stats on Tiles and inside RTC stats modal
  useRTCStatsListeners();

  const landscapeChatViewVisible = useLandscapeChatViewVisible();

  // Clearing any pending modal opening tasks
  React.useEffect(() => {
    return () => {
      clearPendingModalTasks();
    };
  }, []);

  /**
   * TODO: disbaled Expended View animation in Webrtc flow
   *
   * Problem: Tiles Flatlist was not scrollable because Root Pressable was registering screen taps.
   * Solution: Try using Tab Gesture detector instead on Pressable component
   */
  return (
    <SafeAreaView style={styles.container}>
      <MeetingScreenContent peerTrackNodes={peerTrackNodes} />

      {landscapeChatViewVisible ? <ChatView /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DIM,
    flexDirection: 'row',
  },
});
