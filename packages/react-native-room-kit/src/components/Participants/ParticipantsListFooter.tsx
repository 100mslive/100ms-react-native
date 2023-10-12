import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../../hooks-util';

export type ParticipantsListFooterProps = {
  loading: boolean;
};

const _ParticipantsListFooter: React.FC<ParticipantsListFooterProps> = ({
  loading
}) => {
  const { on_surface_high: onSurfaceHigh } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    footer: {
      borderColor: theme.palette.border_bright,
    },
  }));

  return (
    <View style={[styles.footer, hmsRoomStyles.footer]}>
      {loading ? (
        <ActivityIndicator size={'small'} color={onSurfaceHigh} />
      ) : null}
    </View>
  );
};

export const ParticipantsListFooter = React.memo(_ParticipantsListFooter);

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
});
