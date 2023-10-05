import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HMSRole } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../../hooks-util';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';
import { ParticipantsItem } from './ParticipantsItem';

interface ParticipantsAccordianExpandedProps {
  data: {
    id: string;
    label: string;
    data: any[] | undefined;
  };
};

export const ParticipantsAccordianExpanded: React.FC<ParticipantsAccordianExpandedProps> = ({
  data,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      borderColor: theme.palette.border_bright,
    },
    label: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    menu: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_bright,
    },
  }));

  if (!Array.isArray(data.data)) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, hmsRoomStyles.label]}>No one is here!</Text>
      </View>
    );
  }

  return (
    <>
      {data.data.map((participant) => {
        return (
          <ParticipantsItem groupId={data.id} key={participant.peerID} data={participant} />
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
