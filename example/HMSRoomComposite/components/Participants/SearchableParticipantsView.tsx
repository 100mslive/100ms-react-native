import * as React from 'react';

import {useFilteredParticipants} from '../../hooks-util';
import {ParticipantsList, ParticipantsListProps} from './ParticipantsList';
import {ParticipantsSearchInput} from './ParticipantsSeachInput';

export type SearchableParticipantsViewProps = Omit<
  ParticipantsListProps,
  'data'
>;

export const SearchableParticipantsView: React.FC<
  SearchableParticipantsViewProps
> = ({changeName, changeRole, setVolume}) => {
  const {filteredParticipants, searchText, setSearchText} =
    useFilteredParticipants();

  return (
    <>
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
    </>
  );
};
