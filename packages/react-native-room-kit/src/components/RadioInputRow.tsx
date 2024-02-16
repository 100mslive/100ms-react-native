import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { RadioInput } from './RadioInput';
import type { RadioInputProps } from './RadioInput';
import { useHMSRoomStyleSheet } from '../hooks-util';

interface RadioInputRowProps {
  text: string;
  selected: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
  radioSize?: RadioInputProps['size'];
  radioColor?: RadioInputProps['color'];
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const RadioInputRow: React.FC<RadioInputRowProps> = ({
  text,
  containerStyle,
  selected,
  disabled,
  textStyle,
  radioSize,
  radioColor,
  onChange,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.container, containerStyle]}
      onPress={() => onChange(!selected)}
    >
      <View style={styles.radioWrapper}>
        <RadioInput selected={selected} color={radioColor} size={radioSize} />
      </View>

      <Text
        style={[
          styles.normalText,
          hmsRoomStyles.surfaceHighRegularText,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioWrapper: {
    padding: 8,
    marginRight: 8,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
