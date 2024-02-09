import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { CheckBoxIcon } from '../Icons';

interface CheckboxInputRowProps {
  text: string;
  selected: boolean;
  onChange(value: boolean): void;
  disabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CheckboxInputRow: React.FC<CheckboxInputRowProps> = ({
  text,
  containerStyle,
  selected,
  disabled,
  textStyle,
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
        <CheckBoxIcon type={selected ? 'checked' : 'unchecked'} />
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
