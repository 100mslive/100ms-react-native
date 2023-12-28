import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useHMSMessagePinningActions, useHMSRoomStyle, useIsMessagePinned } from '../../hooks-util';
import type { RootState } from '../../redux';
import { BottomSheet } from '../BottomSheet';
import { PinIcon } from '../../Icons';
import { setSelectedMessageForAction } from '../../redux/actions';

interface MessageOptionsViewProps {
  onDismiss?: () => void;
}

const _MessageOptionsView: React.FC<MessageOptionsViewProps> = ({ onDismiss }) => {
  const dispatch = useDispatch();
  const selectedMessageForAction = useSelector((state: RootState) => state.app.selectedMessageForAction);
  const isPinned = useIsMessagePinned(selectedMessageForAction);
  const { pinMessage, unpinMessage } = useHMSMessagePinningActions();

  const closeMessageOptionsBottomSheet = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      dispatch(setSelectedMessageForAction(null));
    }
  };

  const handleMessagePin = () => {
    if (selectedMessageForAction) {
      if (isPinned) {
        unpinMessage(selectedMessageForAction);
      } else {
        pinMessage(selectedMessageForAction);
      }
    }
    closeMessageOptionsBottomSheet();
  };

  return (
    <View>
      <BottomSheet.Header
        heading="Message Options"
        dismissModal={closeMessageOptionsBottomSheet}
      />

      <BottomSheet.Divider style={styles.headerDivider} />

      <MessageOptionsItem
        label={isPinned ? 'Unpin' : 'Pin'}
        icon={<PinIcon type={isPinned ? 'unpin' : 'pin'} style={styles.icon} />}
        onPress={handleMessagePin}
      />

      <View style={styles.bottomSpacer} />
    </View>
  );
};

interface MessageOptionsItemProps {
  label: string;
  onPress(): void;
  icon?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const MessageOptionsItem: React.FC<MessageOptionsItemProps> = ({
  label,
  onPress,
  icon = null,
  style,
  labelStyle,
}) => {
  const textStyle = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {icon}

      <Text style={[styles.text, textStyle, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Item styles
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    marginLeft: 8,
  },
  // Container styles
  headerDivider: {
    marginVertical: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  bottomSpacer: {
    width: '100%',
    height: 32,
  }
});

export const MessageOptionsView = React.memo(_MessageOptionsView);
