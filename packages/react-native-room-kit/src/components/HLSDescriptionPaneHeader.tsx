import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { ChevronIcon } from '../Icons';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
  interpolate,
} from 'react-native-reanimated';

export interface HLSDescriptionPaneHeaderProps {
  close(): void;
  animatedValue: SharedValue<number>;
}

export const HLSDescriptionPaneHeaderHeight = 16 * 2 + 24; // vertical padding + content height

export const HLSDescriptionPaneHeader: React.FC<
  HLSDescriptionPaneHeaderProps
> = ({ close, animatedValue }) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
      borderBottomColor: theme.palette.border_bright,
    },
    semiBoldSurfaceHigh: {
      fontFamily: `${typography.font_family}-SemiBold`,
      color: theme.palette.on_surface_high,
    },
  }));

  const animatedChevronStyles = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotateZ: `${interpolate(animatedValue.value, [0, 1], [0, -180])}deg`,
        },
      ],
    }),
    []
  );

  const closeHlsDescriptionPane = () => {
    close();
  };

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <Text style={[styles.title, hmsRoomStyles.semiBoldSurfaceHigh]}>
        About Session
      </Text>

      <TouchableOpacity
        hitSlop={{ bottom: 12, left: 12, top: 12, right: 12 }}
        onPress={closeHlsDescriptionPane}
      >
        <Animated.View style={animatedChevronStyles}>
          <ChevronIcon direction="down" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
});
