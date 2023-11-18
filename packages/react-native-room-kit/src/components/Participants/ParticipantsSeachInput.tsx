import * as React from 'react';
import { StyleSheet, Platform } from 'react-native';

import { useHMSRoomColorPalette, useHMSRoomStyle } from '../../hooks-util';
import { SearchIcon } from '../../Icons';
import { HMSTextInput } from '../HMSTextInput';
import { TestIds } from '../../utils/constants';

type ParticipantsSearchInputProps = {
  searchText: string;
  setSearchText(text: string): void;
};

export const ParticipantsSearchInput: React.FC<
  ParticipantsSearchInputProps
> = ({ searchText, setSearchText }) => {
  const { on_surface_medium: onSurfaceMediumColor } = useHMSRoomColorPalette();

  const textInputStyle = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.surface_default,
    borderColor: theme.palette.surface_default,
  }));

  return (
    <HMSTextInput
      testID={TestIds.search_participant_input}
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Search for participants"
      style={styles.input}
      containerStyle={[styles.textInputContainer, textInputStyle]}
      focusedContainerStyle={[styles.focusedTextInputContainer, textInputStyle]}
      placeholderTextColor={onSurfaceMediumColor}
      leftIcon={<SearchIcon style={styles.searchIcon} />}
    />
  );
};

const styles = StyleSheet.create({
  focusedTextInputContainer: {
    borderWidth: 1,
  },
  textInputContainer: {
    borderWidth: 1,
    flex: 0,
    height: 40,
    paddingLeft: 8,
    paddingRight: 8,
  },
  input: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
    letterSpacing: 0.25,
  },
  searchIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
});
