import * as React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContext } from '@react-navigation/native';

import { PressableIcon } from './PressableIcon';
import { ChevronIcon } from '../Icons';
import { useHMSRoomStyle } from '../hooks-util';
import { TestIds } from '../utils/constants';

export interface BackButtonProps {}

export const BackButton: React.FC<BackButtonProps> = () => {
  const navigation = React.useContext(NavigationContext);

  const buttonStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.surface_default,
  }));

  if (!navigation || !navigation.canGoBack()) {
    return null;
  }

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <PressableIcon
      testID={TestIds.back_button}
      style={[styles.button, buttonStyles]}
      rounded={true}
      border={false}
      onPress={handleGoBack}
    >
      <ChevronIcon direction="left" />
    </PressableIcon>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    marginLeft: 16,
  },
});
