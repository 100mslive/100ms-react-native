import * as React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { CloseIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';
import type { RootState } from '../../redux';

type ParticipantsHeaderProps = {
  onClosePress(): void;
};

export const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({
  onClosePress,
}) => {
  const peersCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount ?? 0
  );

  const titleStyle = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, titleStyle]}>
        Participants ({peersCount})
      </Text>

      <TouchableOpacity onPress={onClosePress}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
