import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { HMSRole } from '@100mslive/react-native-hms';

import { ParticipantsGroupHeader } from './ParticipantsGroupHeader';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { ParticipantsGroupFooter } from './ParticipantsGroupFooter';
import { ParticipantsAccordianExpanded } from './ParticipantsAccordianExpanded';

export interface ParticipantsAccordianProps {
  open: boolean;
  // role: HMSRole;
  showViewAll?: boolean;
  data: { id: string; label: string; data: any[] | undefined; };
  toggle(uid: string | null): void;
};

export const ParticipantsAccordian: React.FC<ParticipantsAccordianProps> = ({
  open,
  toggle,
  data,
  showViewAll=false,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      borderColor: theme.palette.border_bright,
    },
    label: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    menu: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_bright,
    },
  }));

  return (
    <View style={[
      styles.container,
      hmsRoomStyles.container,
    ]}>
      <ParticipantsGroupHeader
        data={data}
        expanded={open}
        toggleExpanded={toggle}
      />

      {open ? <ParticipantsAccordianExpanded data={data} /> : null}

      {open && showViewAll ? <ParticipantsGroupFooter /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
