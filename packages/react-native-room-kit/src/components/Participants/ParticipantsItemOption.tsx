import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

import { useHMSRoomStyle } from '../../hooks-util';

interface ParticipantsItemOptionProps {
  label: string;
  onPress(): void;
  icon?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  // isActive?: boolean;
  // hide?: boolean;
}

const _ParticipantsItemOption: React.FC<ParticipantsItemOptionProps> = ({
  icon = null,
  label,
  onPress,
  style,
  labelStyle,
}) => {
  const textStyle = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {icon}

      <Text style={[styles.text, textStyle, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginLeft: 8,
  },
});

export const ParticipantsItemOption = React.memo(_ParticipantsItemOption);
