import * as React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContext } from '@react-navigation/native';

import { COLORS } from '../utils/theme';
import { PressableIcon } from './PressableIcon';
import { ChevronIcon } from '../Icons';

export interface BackButtonProps {}

export const BackButton: React.FC<BackButtonProps> = () => {
  const navigation = React.useContext(NavigationContext);

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
      style={styles.button}
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
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
});
