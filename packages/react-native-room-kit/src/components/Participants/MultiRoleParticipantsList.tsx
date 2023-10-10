import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFilteredParticipants, useHMSRoomStyle } from '../../hooks-util';
import { ParticipantsAccordian } from './ParticipantsAccordian';

export type MultiRoleParticipantsListProps = {
  searchText: string;
  onViewAllPress(groupId: string): void;
};

export const MultiRoleParticipantsList: React.FC<MultiRoleParticipantsListProps> = ({
  searchText,
  onViewAllPress
}) => {
  const {
    data,
    formattedSearchText,
    expandedGroup,
    setExpandedGroup,
  } = useFilteredParticipants(searchText);

  const emptyTextStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_medium,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  const searchTextExists = formattedSearchText.length > 0

  if (searchTextExists && data.length <= 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, emptyTextStyles]}>
          No results found...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{paddingBottom: 40}}>
      {data.map(item => (
        <ParticipantsAccordian
          key={item.id}
          open={expandedGroup === item.id}
          data={item}
          toggle={setExpandedGroup}
          showViewAll={item.showViewAll}
          onViewAllPress={onViewAllPress}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
