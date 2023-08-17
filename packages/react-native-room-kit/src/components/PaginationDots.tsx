import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';

export interface PaginationDotsProps {
  list: any[];
}

const _PaginationDots: React.FC<PaginationDotsProps> = ({ list }) => {
  const activeIndex = useSelector(
    (state: RootState) => state.app.gridViewActivePage
  );

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme) => ({
      dot: { backgroundColor: theme.palette.on_surface_low },
      activeDot: { backgroundColor: theme.palette.on_surface_high },
    }),
    []
  );

  return (
    <View style={styles.container}>
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
