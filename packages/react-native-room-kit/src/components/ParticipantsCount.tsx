import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';

const _ParticipantsCount = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_bright,
    },
    count: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const peerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );

  if (typeof peerCount !== 'number') {
    return null;
  }

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <Text style={[styles.count, hmsRoomStyles.count]}>{peerCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    borderRadius: 40,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});

export const ParticipantsCount = React.memo(_ParticipantsCount);
