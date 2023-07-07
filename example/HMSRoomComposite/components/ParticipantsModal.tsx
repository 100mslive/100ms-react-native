import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import type {HMSPeer} from '@100mslive/react-native-hms';

import {useFilteredParticipants} from '../hooks-util';
import {
  ParticipantsHeader,
  ParticipantsList,
  ParticipantsSearchInput,
} from './Participants';

type ParticipantsModalProps = {
  changeName(peer: HMSPeer): void;
  changeRole(peer: HMSPeer): void;
  setVolume(peer: HMSPeer): void;
};

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  changeName,
  changeRole,
  setVolume,
}) => {
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

      <ParticipantsList
        data={filteredParticipants}
        changeName={changeName}
        changeRole={changeRole}
        setVolume={setVolume}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  participantContainer: {
    height: '100%',
    width: '100%',
  },
});
