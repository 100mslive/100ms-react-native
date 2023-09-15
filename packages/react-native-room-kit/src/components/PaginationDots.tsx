import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

export interface PaginationDotsProps {
  list: any[];
  activeIndex: number;
  style?: StyleProp<ViewStyle>;
}

const _PaginationDots: React.FC<PaginationDotsProps> = ({
  list,
  activeIndex,
  style,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme) => ({
      dot: { backgroundColor: theme.palette.on_surface_low },
      activeDot: { backgroundColor: theme.palette.on_surface_high },
    }),
    []
  );

  return (
    <View style={[styles.container, style]}>
      {list.map((listItem, idx) => {
        const isActive = activeIndex === idx;
        const isFirst = idx === 0;

        return (
          <View
            key={listItem?.id || idx.toString()}
            style={[
              styles.dot,
              hmsRoomStyles.dot,
              isFirst ? styles.firstDot : null,
              isActive ? hmsRoomStyles.activeDot : null,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    aspectRatio: 1,
    borderRadius: 4,
    marginLeft: 12,
  },
  firstDot: {
    marginLeft: 0,
  },
});

export const PaginationDots = React.memo(_PaginationDots);
