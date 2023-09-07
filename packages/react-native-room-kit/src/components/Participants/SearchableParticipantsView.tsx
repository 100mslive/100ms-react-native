import * as React from 'react';
import { View } from 'react-native';

import { useFilteredParticipants } from '../../hooks-util';
import { ParticipantsList } from './ParticipantsList';
import { ParticipantsSearchInput } from './ParticipantsSeachInput';

export const SearchableParticipantsView: React.FC = () => {
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

      <View
        style={{
          flex: 1,
          marginTop: 8,
        }}
      >
        <ParticipantsList
          data={data}
          setExpandedGroups={setExpandedGroups}
          searchTextExists={formattedSearchText.length > 0}
        />
      </View>
    </>
  );
};
