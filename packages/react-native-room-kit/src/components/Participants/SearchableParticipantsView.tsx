import * as React from 'react';

import { useFilteredParticipants } from '../../hooks-util';
import { ParticipantsList } from './ParticipantsList';
import { ParticipantsSearchInput } from './ParticipantsSeachInput';

export const SearchableParticipantsView: React.FC = () => {
  const { filteredParticipants, searchText, setSearchText } =
    useFilteredParticipants();

  return (
    <>
      <ParticipantsSearchInput
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <ParticipantsList data={filteredParticipants} />
    </>
  );
};
