import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { CustomInput } from '../CustomInput';
import { COLORS } from '../../utils/theme';

type ParticipantsSearchInputProps = {
  searchText: string;
  setSearchText(text: string): void;
};

export const ParticipantsSearchInput: React.FC<
  ParticipantsSearchInputProps
> = ({ searchText, setSearchText }) => {
  return (
    <View>
      <CustomInput
        value={searchText}
        onChangeText={setSearchText}
        inputStyle={styles.participantsSearchInput}
        placeholderTextColor={COLORS.TEXT.DISABLED}
        placeholder="Find what you're looking for"
      />
      <Ionicons
        name="search"
        style={styles.participantsSearchInputIcon}
        size={24}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  participantsSearchInput: {
    backgroundColor: COLORS.SURFACE.DEFAULT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 48,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
  },
  participantsSearchInputIcon: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    left: 16,
    right: 16,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    width: 24,
  },
});
