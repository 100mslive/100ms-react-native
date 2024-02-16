import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ColorValue } from 'react-native';

export interface RadioInputProps {
  selected: boolean;
  size?: number;
  color?: ColorValue;
}

export const RadioInput: React.FC<RadioInputProps> = ({
  selected,
  size = 24,
  color = 'white',
}) => {
  const outerCircleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: size / 12,
    borderColor: color,
  };

  const innerCircleStyle = {
    width: size / 2,
    height: size / 2,
    borderRadius: size / 4,
    backgroundColor: color,
  };

  return (
    <View style={[styles.outerCircle, outerCircleStyle]}>
      {selected ? <View style={innerCircleStyle} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
  },
});
