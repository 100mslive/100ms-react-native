import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useHMSRoomStyleSheet } from '../hooks-util';

export interface HMSPreviewPeersListProps {}

export const HMSPreviewPeersList: React.FC<HMSPreviewPeersListProps> = () => {
  const previewPeerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_default,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  if (typeof previewPeerCount !== 'number') {
    return null;
  }

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <Text style={[styles.text, hmsRoomStyles.text, styles.textSpacer]}>
        {previewPeerCount <= 0
          ? 'You are the first to join'
          : `${previewPeerCount} ${
              previewPeerCount > 1 ? 'others' : 'other'
            } in session`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 24,
  },
  textSpacer: {
    marginHorizontal: 8,
  },
});
