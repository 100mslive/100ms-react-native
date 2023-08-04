import React from 'react';
import {
  Switch,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { COLORS } from '../utils/theme';

interface SwitchRow {
  value: boolean;
  onChange(value: boolean): void;
  text: string;
  containerStyle?: StyleProp<ViewStyle>;
  LeftIcon?: React.ReactNode;
}

export const SwitchRow: React.FC<SwitchRow> = ({
  text,
  LeftIcon,
  containerStyle,
  value,
  onChange,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.container}>
        {LeftIcon}

        <Text style={styles.text}>{text}</Text>
      </View>

      <Switch
        value={value}
        thumbColor={COLORS.WHITE}
        trackColor={{
          true: COLORS.PRIMARY.DEFAULT,
          false: COLORS.SECONDARY.DISABLED,
        }}
        onValueChange={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
