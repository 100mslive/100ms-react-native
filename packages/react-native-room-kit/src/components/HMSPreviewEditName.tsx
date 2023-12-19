import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { changeUsername } from '../redux/actions';
import { useHMSConfig } from '../hooks-util';
import { HMSTextInput } from './HMSTextInput';
import { TestIds } from '../utils/constants';

export interface HMSPreviewEditNameProps {}

export const HMSPreviewEditName: React.FC<HMSPreviewEditNameProps> = () => {
  const dispatch = useDispatch();
  const { updateConfig } = useHMSConfig();
  const userName = useSelector((state: RootState) => state.user.userName);
  const editUsernameDisabled = useSelector(
    (state: RootState) => state.app.editUsernameDisabled
  );

  const handleNameChange = (name: string) => {
    dispatch(changeUsername(name));
    updateConfig({ username: name });
  };

  return (
    <HMSTextInput
      editable={!editUsernameDisabled}
      testID={TestIds.enter_name}
      value={userName}
      onChangeText={handleNameChange}
      style={editUsernameDisabled ? { opacity: 0.5 } : null}
    />
  );
};
