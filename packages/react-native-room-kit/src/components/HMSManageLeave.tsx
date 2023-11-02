import * as React from 'react';
import { View } from 'react-native';

import { LeaveIcon } from '../Icons';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { ModalTypes } from '../utils/types';
import { PressableIcon } from './PressableIcon';
import { COLORS } from '../utils/theme';
import { TestIds } from '../utils/constants';

export const HMSManageLeave: React.FC<LeaveButtonProps> = (props) => {
  // TODO: read current meeting joined state
  const isMeetingJoined = true;

  if (!isMeetingJoined) {
    return null;
  }

  return <LeaveButton {...props} />;
};

type LeaveButtonProps =
  | {
      leaveIconDelegate?: React.ReactComponentElement<any>;
    }
  | {
      leaveButtonDelegate?: React.ReactComponentElement<any>;
    };

const LeaveButton: React.FC<LeaveButtonProps> = (props) => {
  const { handleModalVisibleType } = useModalType();

  /**
   * Opens the Leave Popup Menu
   */
  const handleLeaveButtonPress = () => {
    handleModalVisibleType(ModalTypes.LEAVE_ROOM);
  };

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    button: {
      backgroundColor: theme.palette.alert_error_default,
      borderColor: theme.palette.alert_error_default,
    },
    icon: {
      tintColor: COLORS.WHITE,
    },
  }));

  const leaveIconDelegate =
    'leaveIconDelegate' in props && props.leaveIconDelegate ? (
      props.leaveIconDelegate
    ) : (
      <LeaveIcon style={hmsRoomStyles.icon} />
    );

  const leaveButtonDelegate =
    'leaveButtonDelegate' in props && props.leaveButtonDelegate ? (
      props.leaveButtonDelegate
    ) : (
      <PressableIcon>{React.cloneElement(leaveIconDelegate)}</PressableIcon>
    );

  return (
    <View>
      {React.cloneElement(leaveButtonDelegate, {
        onPress: handleLeaveButtonPress,
        style: hmsRoomStyles.button,
        testID: TestIds.footer_leave_btn
      })}
    </View>
  );
};
