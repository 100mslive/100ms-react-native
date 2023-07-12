import * as React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {COLORS} from '../../utils/theme';
import type {RootState} from '../../redux';
import {CustomButton} from '../CustomButton';

export const PinnedMessage = () => {
  const pinnedMessage = useSelector(
    (state: RootState) => state.messages.pinnedMessage,
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore,
  );

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
    <View style={styles.pinnedMessage}>
      <View style={styles.bannerIconContainer}>
        <MaterialCommunityIcons
          style={styles.bannerIcon}
          size={16}
          name="pin-outline"
        />
      </View>
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerText}>{pinnedMessage}</Text>
      </View>
      <CustomButton
        onPress={removePinnedMessage}
        viewStyle={styles.bannerIconContainer}
        LeftIcon={
          <MaterialCommunityIcons
            style={styles.bannerIcon}
            size={24}
            name="close"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pinnedMessage: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 8,
  },
  bannerIcon: {
    color: COLORS.TEXT.DISABLED,
  },
  bannerIconContainer: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
});
