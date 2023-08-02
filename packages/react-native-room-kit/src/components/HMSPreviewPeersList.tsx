import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';

export interface HMSPreviewPeersListProps {}

export const HMSPreviewPeersList: React.FC<HMSPreviewPeersListProps> = () => {
  const previewPeersList = useSelector(
    (state: RootState) => state.hmsStates.previewPeersList
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.text, styles.textSpacer]}>
        {previewPeersList.length === 0
          ? 'You are the first to join'
          : `${previewPeersList.length} ${
              previewPeersList.length > 1 ? 'others' : 'other'
            } in session`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: COLORS.BORDER.DEFAULT,
    borderWidth: 1,
  },
  text: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
  },
  textSpacer: {
    marginHorizontal: 8,
  },
});
