import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { useFilteredParticipants, useHMSRoomStyle } from '../hooks-util';
import {
  ParticipantsHeader,
  ParticipantsList,
  ParticipantsSearchInput,
} from './Participants';

type ParticipantsModalProps = {
  dismissModal(): void;
};

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  dismissModal,
}) => {
  const {
    data,
    searchText,
    formattedSearchText,
    setSearchText,
    setExpandedGroups,
  } = useFilteredParticipants();

  const containerStyle = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.surface_dim,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <ParticipantsHeader onClosePress={dismissModal} />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  listWrapper: {
    flex: 1,
    marginTop: 8
  },
});
