import * as React from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import type { HMSPeer } from '@100mslive/react-native-hms';

import { HandIcon } from '../Icons';
import {
  useHMSInstance,
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
}

export const HMSHandRaiseNotification: React.FC<
  HMSHandRaiseNotificationProps
> = ({ peer, id }) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const broadcasterRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role!
  );

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
    dispatch(removeNotification(id));
    await hmsInstance.changeRoleOfPeer(peer, broadcasterRole, false);
  };

  return (
    <HMSNotification
      id={id}
      icon={<HandIcon />}
      text={`${peer.name} raised hand`}
      dismissDelay={30000}
      cta={
        <TouchableHighlight
          underlayColor={secondaryDimColor}
          style={[styles.button, hmsRoomStyles.button]}
          onPress={bringPeerToStage}
        >
          <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
            Bring on Stage
          </Text>
        </TouchableHighlight>
      }
    />
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
