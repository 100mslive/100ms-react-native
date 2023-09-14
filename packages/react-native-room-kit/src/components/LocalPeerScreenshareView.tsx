import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CustomButton } from './CustomButton';
import { useHMSActions } from '../hooks-sdk';
import { COLORS } from '../utils/theme';

export const LocalPeerScreenshareView = () => {
  const hmsActions = useHMSActions();

  const onEndScreenSharePress = async () => {
    await hmsActions.setScreenShareEnabled(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You are sharing your screen</Text>
      <CustomButton
        title="X   Stop Screenshare"
        onPress={onEndScreenSharePress}
        viewStyle={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  text: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },
  button: {
    backgroundColor: COLORS.INDICATORS.ERROR,
    borderColor: COLORS.INDICATORS.ERROR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    width: '60%',
    alignSelf: 'center',
    marginTop: 48,
  },
  buttonText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
});
