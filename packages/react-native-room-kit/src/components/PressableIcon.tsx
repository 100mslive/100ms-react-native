import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useHMSRoomStyleSheet, useIsHLSViewer } from '../hooks-util';

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
          ? theme.palette.surface_default
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

  const tapGesture = React.useMemo(() => Gesture.Tap(), []);

  return (
    <GestureDetector gesture={tapGesture}>
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
    </GestureDetector>
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
