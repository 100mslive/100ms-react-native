import * as React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useHMSRoomStyleSheet, useLeaveMethods } from '../hooks-util';
import { AlertTriangleIcon, CloseIcon } from '../Icons';
import { HMSDangerButton } from './HMSDangerButton';
import type { RootState } from '../redux';
import { OnLeaveReason } from '../utils/types';
import { TestIds } from '../utils/constants';
import { useIsHLSStreamingOn } from '../hooks-sdk';

export interface EndRoomModalContentProps {
  dismissModal(): void;
}

export const EndRoomModalContent: React.FC<EndRoomModalContentProps> = ({
  dismissModal,
}) => {
  const { endRoom, leave } = useLeaveMethods();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.alert_error_default,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    text: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const canEndRoom = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role?.permissions?.endRoom
  );

  const canStream = useSelector(
    (state: RootState) =>
      state.hmsStates.localPeer?.role?.permissions?.hlsStreaming
  );

  const isHLSStreaming = useIsHLSStreamingOn();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <AlertTriangleIcon />

          <Text
            testID={TestIds.end_confirmation_heading}
            style={[styles.headerText, hmsRoomStyles.headerText]}
          >
            {canStream && isHLSStreaming
              ? 'End Stream'
              : canEndRoom
                ? 'End Session'
                : 'Leave'}
          </Text>
        </View>

        <TouchableOpacity
          testID={TestIds.end_confirmation_close_btn}
          onPress={dismissModal}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      <Text
        testID={TestIds.end_confirmation_description}
        style={[styles.text, hmsRoomStyles.text]}
      >
        {canStream && isHLSStreaming
          ? 'The stream will end for everyone after they’ve watched it.'
          : canEndRoom
            ? 'The session will end for everyone in the room immediately. '
            : 'Others will continue after you leave. You can join the session again.'}
      </Text>
      <HMSDangerButton
        testID={TestIds.end_confirmation_cta}
        loading={false}
        onPress={() => {
          if (canStream && isHLSStreaming) {
            leave(OnLeaveReason.LEAVE, true);
          } else {
            endRoom(OnLeaveReason.ROOM_END);
          }
        }}
        title={canStream && isHLSStreaming ? 'End Stream' : 'End Session'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 24,
  },
});
