import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { useHMSRoomStyleSheet, useLeaveMethods } from '../hooks-util';
import { AlertTriangleIcon, CloseIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';

export interface EndRoomModalContentProps {
  dismissModal(): void;
}

export const EndRoomModalContent: React.FC<EndRoomModalContentProps> = ({ dismissModal }) => {
  const { endRoom } = useLeaveMethods();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.alert_error_default,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    text: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`
    }
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <AlertTriangleIcon />

          <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
            End Session
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismissModal}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <Text style={[styles.text, hmsRoomStyles.text]}>The session will end for everyone and all the activities will stop. You can't undo this action.</Text>

      <HMSDangerButton
        loading={false}
        onPress={endRoom}
        title='End Session'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginLeft: 8,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    marginBottom: 24
  }
});
