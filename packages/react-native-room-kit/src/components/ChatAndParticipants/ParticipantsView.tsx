import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { ParticipantsList, ParticipantsSearchInput } from '../Participants';
import { MultiRoleParticipantsList } from '../Participants/MultiRoleParticipantsList';

type ParticipantsViewProps = {};

export const ParticipantsView: React.FC<ParticipantsViewProps> = () => {
  const [searchText, setSearchText] = React.useState('');
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(
    null
  );

  const clearSelectedGroup = React.useCallback(() => {
    setSelectedGroupId(null);
  }, []);

  return (
    <>
      <ParticipantsSearchInput
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <View style={styles.listWrapper}>
        {selectedGroupId === null ? (
          <MultiRoleParticipantsList
            searchText={searchText}
            onViewAllPress={setSelectedGroupId}
          />
        ) : (
          <ParticipantsList
            searchText={searchText}
            selectedGroupId={selectedGroupId}
            onBackPress={clearSelectedGroup}
          />
        )}
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
