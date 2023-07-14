import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '../../utils/theme';
import { ParticipantFilter } from './ParticipantsFilter';

type ParticipantsHeaderProps = {
  participantsCount: number;
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
};

export const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({
  participantsCount,
  filter,
  setFilter,
}) => {
  return (
    <View style={styles.participantsHeaderContainer}>
      <Text style={styles.participantsHeading}>Participants</Text>

      <ParticipantFilter filter={filter} setFilter={setFilter} />

      <View style={styles.peerCountContainer}>
        <Text style={styles.peerCount}>{participantsCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  participantsHeaderContainer: {
    height: 48,
    width: '80%',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsHeading: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    paddingRight: 12,
  },
  peerCountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.BORDER.ACCENT,
    borderWidth: 2,
    borderRadius: 30,
    marginLeft: 12,
    height: 30,
    paddingHorizontal: 6,
  },
  peerCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
