import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { useFilteredParticipants } from '../../hooks-util';
import { ParticipantsList, ParticipantsSearchInput } from '../Participants';

type ParticipantsViewProps = {};

export const ParticipantsView: React.FC<ParticipantsViewProps> = () => {
  const {
    data,
    searchText,
    formattedSearchText,
    setSearchText,
    setExpandedGroups,
  } = useFilteredParticipants();

  return (
    <>
      <ParticipantsSearchInput
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <View style={styles.listWrapper}>
        <ParticipantsList
          data={data}
          setExpandedGroups={setExpandedGroups}
          searchTextExists={formattedSearchText.length > 0}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    marginTop: 8,
  },
});
