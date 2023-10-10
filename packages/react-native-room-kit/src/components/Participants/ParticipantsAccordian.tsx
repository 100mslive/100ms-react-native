import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { ParticipantsGroupHeader } from './ParticipantsGroupHeader';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { ParticipantAccordianData } from '../../hooks-util';
import { ParticipantsGroupFooter } from './ParticipantsGroupFooter';
import { ParticipantsAccordianExpanded } from './ParticipantsAccordianExpanded';

export interface ParticipantsAccordianProps {
  open: boolean;
  // role: HMSRole;
  showViewAll?: boolean;
  data: ParticipantAccordianData;
  toggle(uid: string | null): void;
  onViewAllPress(groupId: string): void;
}

export const ParticipantsAccordian: React.FC<ParticipantsAccordianProps> = ({
  open,
  data,
  showViewAll = false,
  toggle,
  onViewAllPress,
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
    <View style={[styles.container, hmsRoomStyles.container]}>
      <ParticipantsGroupHeader
        id={data.id}
        label={data.label}
        expanded={open}
        toggleExpanded={toggle}
      />

      {open ? (
        <ParticipantsAccordianExpanded id={data.id} data={data.data} />
      ) : null}

      {open && showViewAll ? (
        <ParticipantsGroupFooter
          groupId={data.id}
          onViewAllPress={onViewAllPress}
        />
      ) : null}
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
