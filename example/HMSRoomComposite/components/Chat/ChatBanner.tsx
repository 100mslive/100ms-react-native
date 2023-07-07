import * as React from 'react';
import {View, StyleSheet, Text, Platform} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {COLORS} from '../../utils/theme';
import {CustomButton} from '../CustomButton';

export const ChatBanner = () => {
  const [showBanner, setShowBanner] = React.useState(true);

  if (!showBanner) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.bannerIconContainer}>
        <Feather style={styles.bannerIcon} size={16} name="info" />
      </View>
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerText}>
          Messages can only be seen by people in the call and are deleted when
          the call ends.
        </Text>
      </View>
      <CustomButton
        onPress={() => setShowBanner(false)}
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
  banner: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 8,
    transform: [Platform.OS === 'android' ? {scale: -1} : {scaleY: -1}],
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
