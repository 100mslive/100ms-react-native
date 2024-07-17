// @ts-ignore - Ignoring React import as it is generating error while running prepack script
import React from 'react';

import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../utils/theme';

export interface MenuDividerProps {
  color?: string;
}

export function MenuDivider({
  color = COLORS.BORDER.DEFAULT,
}: MenuDividerProps) {
  return <View style={[styles.divider, { borderBottomColor: color }]} />;
}

const styles = StyleSheet.create({
  divider: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
