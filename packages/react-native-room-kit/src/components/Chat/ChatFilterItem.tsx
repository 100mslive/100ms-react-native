import * as React from 'react';
import { useDispatch } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { HMSRemotePeer, HMSRole } from '@100mslive/react-native-hms';

import { CheckIcon } from '../../Icons';
import { useHMSRoomStyle } from '../../hooks-util';
import { ChatBroadcastFilter } from '../../utils/types';
import { setChatFilterSheetVisible } from '../../redux/actions';

interface ChatFilterItemProps {
  item: HMSRemotePeer | HMSRole | typeof ChatBroadcastFilter;
  disabled?: boolean;
  active?: boolean;
  icon?: React.ReactElement;
  onDismiss?: () => void;
}

const _ChatFilterItem: React.FC<ChatFilterItemProps> = ({
  item,
  disabled,
  active,
  icon,
  onDismiss,
}) => {
  const dispatch = useDispatch();

  const titleStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_high,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  const handleFilterSelect = () => {
    dispatch({ type: 'SET_SENDTO', sendTo: item });
    if (onDismiss) {
      onDismiss();
    } else {
      dispatch(setChatFilterSheetVisible(false));
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleFilterSelect}
      disabled={disabled}
    >
      {icon ? <View style={styles.leftIcon}>{icon}</View> : null}

      <Text style={[styles.title, titleStyles]}>{item.name}</Text>

      {active ? <CheckIcon style={styles.rightIcon} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    textTransform: 'capitalize',
  },
  rightIcon: { marginLeft: 8 },
  leftIcon: { marginRight: 8 },
});

export const ChatFilterItem = React.memo(_ChatFilterItem);
