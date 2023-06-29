import * as React from 'react';
import {StyleSheet, TextInput} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {COLORS} from '../utils/theme';
import {RootState} from '../redux';
import {changeUsername} from '../redux/actions';
import {useHMSConfig} from '../hooks-util';

export interface HMSPreviewEditNameProps {}

export const HMSPreviewEditName: React.FC<HMSPreviewEditNameProps> = () => {
  const dispatch = useDispatch();
  const {clearConfig} = useHMSConfig();
  const userName = useSelector((state: RootState) => state.user.userName);
  const [inputFocused, setInputFocused] = React.useState(false);

  const handleNameChange = (name: string) => {
    dispatch(changeUsername(name));
    clearConfig();
  };

  const handleInputFocus = () => setInputFocused(true);

  const handleInputBlur = () => setInputFocused(false);

  return (
    <TextInput
      style={[styles.input, inputFocused ? styles.focusedInput : null]}
      value={userName}
      onChangeText={handleNameChange}
      placeholder="Name"
      autoCapitalize="words"
      autoCompleteType="name"
      placeholderTextColor={COLORS.SURFACE.ON_SURFACE.LOW}
      selectionColor={COLORS.SURFACE.ON_SURFACE.HIGH}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    textAlignVertical: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0.5,
    borderWidth: 2,
    borderColor: COLORS.SURFACE.DEFAULT,
  },
  focusedInput: {
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderWidth: 2,
  },
});
