import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../../redux';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { CloseIcon, PinIcon } from '../../Icons';

export const PinnedMessage = () => {
  const pinnedMessage = useSelector(
    (state: RootState) => state.messages.pinnedMessage
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    closeIcon: {
      tintColor: theme.palette.on_surface_medium,
    },
    text: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_high,
    },
  }));

  const removePinnedMessage = React.useCallback(async () => {
    // If instance of HMSSessionStore is available
    if (hmsSessionStore) {
      try {
        // set `value` on `session` with key 'pinnedMessage'
        const response = await hmsSessionStore.set(null, 'pinnedMessage');
        console.log('setSessionMetaData Response -> ', response);
      } catch (error) {
        console.log('setSessionMetaData Error -> ', error);
      }
    }
  }, [hmsSessionStore]);

  if (!pinnedMessage || pinnedMessage.length <= 0) {
    return null;
  }

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <PinIcon style={[styles.icon, hmsRoomStyles.closeIcon]} />

      <ScrollView style={styles.textWrapper}>
        <Text style={[styles.text, hmsRoomStyles.text]}>{pinnedMessage}</Text>
      </ScrollView>

      <TouchableOpacity onPress={removePinnedMessage}>
        <CloseIcon style={[styles.icon, hmsRoomStyles.closeIcon]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  textWrapper: {
    maxHeight: 50,
    marginHorizontal: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
