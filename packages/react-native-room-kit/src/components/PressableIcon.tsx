import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

interface PressableIconProps extends Omit<TouchableOpacityProps, 'children'> {
  children: Pick<TouchableOpacityProps, 'children'>;
  active?: boolean;
  rounded?: boolean;
  border?: boolean;
}

export const PressableIcon: React.FC<PressableIconProps> = ({
  children,
  style,
  active = false,
  rounded = false,
  border = true,
  ...restProps
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    border: {
      borderColor: theme.palette.border_bright,
    },
    active: {
      backgroundColor: theme.palette.secondary_dim,
      borderColor: theme.palette.secondary_dim,
    },
  }));

  return (
    <TouchableOpacity
      style={[
        styles.pressable,
        {
          borderRadius: rounded ? 20 : undefined,
          ...(border
            ? { ...styles.withBorder, ...hmsRoomStyles.border }
            : undefined),
          ...(active ? hmsRoomStyles.active : undefined),
        },
        style,
      ]}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  withBorder: {
    borderRadius: 8,
    borderWidth: 1,
  },
});
