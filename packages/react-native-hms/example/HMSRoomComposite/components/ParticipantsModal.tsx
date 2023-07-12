import * as React from 'react';
import {View, StyleSheet} from 'react-native';

import {useFilteredParticipants} from '../hooks-util';
import {
  ParticipantsHeader,
  ParticipantsList,
  ParticipantsSearchInput,
} from './Participants';

type ParticipantsModalProps = {};

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({}) => {
  const {
    selectedFilter,
    changeFilter,
    allParticipants,
    filteredParticipants,
    searchText,
    setSearchText,
  } = useFilteredParticipants();

  return (
    <View style={styles.participantContainer}>
      <ParticipantsHeader
        filter={selectedFilter}
        setFilter={changeFilter}
        participantsCount={allParticipants.length}
      />

      <ParticipantsSearchInput
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <ParticipantsList data={filteredParticipants} />
    </View>
  );
};

const styles = StyleSheet.create({
  participantContainer: {
    height: '100%',
    width: '100%',
  },
});
