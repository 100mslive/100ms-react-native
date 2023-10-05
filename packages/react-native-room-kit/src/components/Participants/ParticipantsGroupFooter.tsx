import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useHMSRoomStyleSheet } from '../../hooks-util';
// import type {
//   ParticipantHandRaisedHeaderData,
//   ParticipantHeaderData,
// } from '../../hooks-util';
import { ChevronIcon } from '../../Icons';

interface ParticipantsGroupHeaderProps {
  // data: ParticipantHeaderData | ParticipantHandRaisedHeaderData;
}

const _ParticipantsGroupFooter: React.FC<ParticipantsGroupHeaderProps> = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      borderTopColor: theme.palette.border_bright,
    },
    label: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const handleViewAllPress = () => {};

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <TouchableOpacity
        style={[styles.viewAllAction]}
        onPress={handleViewAllPress}
      >
        <Text style={[styles.label, hmsRoomStyles.label]}>View All</Text>

        <ChevronIcon direction="right" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginRight: 4,
  },
  viewAllAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const ParticipantsGroupFooter = React.memo(_ParticipantsGroupFooter);
