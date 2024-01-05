import * as React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import type { HMSPeer } from '@100mslive/react-native-hms';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { HandIcon } from '../Icons';
import {
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { HMSNotification } from './HMSNotification';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux';
import { removeNotification } from '../redux/actions';

export interface HMSHandRaiseNotificationProps {
  peer: HMSPeer;
  id: string;
  dismissDelay?: number;
  autoDismiss?: boolean;
}

export const HMSHandRaiseNotification: React.FC<
  HMSHandRaiseNotificationProps
> = ({ peer, id, dismissDelay = 5000, autoDismiss }) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const onStageExpData = useHMSLayoutConfig(
    (layoutConfig) =>
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
  );
  const onStageRole = useSelector((state: RootState) => {
    const onStageRoleStr = onStageExpData?.on_stage_role;
    if (!onStageRoleStr) {
      return null;
    }
    return (
      state.hmsStates.roles.find((role) => role.name === onStageRoleStr) || null
    );
  });

  const { secondary_dim: secondaryDimColor } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.secondary_default,
    },
    buttonText: {
      color: theme.palette.on_secondary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const bringPeerToStage = async () => {
    if (!onStageRole) {
      return Promise.reject(
        `${
          onStageExpData ? '"on_stage_role"' : '"on_stage_exp"'
        } data is not available`
      );
    }
    dispatch(removeNotification(id));
    await hmsInstance.changeRoleOfPeer(
      peer,
      onStageRole,
      onStageExpData?.skip_preview_for_role_change || false
    );
  };

  return (
    <HMSNotification
      id={id}
      icon={<HandIcon />}
      text={`${peer.name} raised hand`}
      dismissDelay={dismissDelay}
      autoDismiss={autoDismiss}
      cta={
        <GestureDetector gesture={Gesture.Tap()}>
          <TouchableHighlight
            underlayColor={secondaryDimColor}
            style={[styles.button, hmsRoomStyles.button]}
            onPress={bringPeerToStage}
          >
            <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
              {onStageExpData?.bring_to_stage_label || 'Bring to Stage'}
            </Text>
          </TouchableHighlight>
        </GestureDetector>
      }
    />
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
