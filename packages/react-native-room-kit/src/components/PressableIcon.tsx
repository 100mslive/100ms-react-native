import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

import { useHMSRoomStyleSheet, useIsHLSViewer } from '../hooks-util';
import { hexToRgbA } from '../utils/theme';

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
  const isHLSViewer = useIsHLSViewer();

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme) => ({
      pressable: {
        backgroundColor: isHLSViewer
          ? hexToRgbA(theme.palette.background_dim, 0.64)
          : undefined,
      },
      border: {
        borderColor: theme.palette.border_bright,
      },
      active: {
        backgroundColor: theme.palette.surface_brighter,
        borderColor: theme.palette.surface_brighter,
      },
    }),
    [isHLSViewer]
  );

  return (
    <TouchableOpacity
      style={[
        styles.pressable,
        hmsRoomStyles.pressable,
        {
          borderRadius: rounded ? 20 : 8,
          ...(border && !isHLSViewer
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
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
  },
  withBorder: {
    borderWidth: 1,
  },
});
