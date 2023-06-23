import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS} from '../utils/theme';
import {CustomButton} from './CustomButton';
import {HMSManageLocalAudio} from './HMSManageLocalAudio';
import {HMSManageLocalVideo} from './HMSManageLocalVideo';
import {HMSShowNetworkQuality} from './HMSShowNetworkQuality';
import {HMSPreviewTile} from './HMSPreviewTile';

export const Preview = ({
  join,
  loadingButtonState,
}: {
  join: Function;
  loadingButtonState: boolean;
}) => {
  const {top, bottom, left, right} = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <HMSPreviewTile />

      <View style={[styles.textContainer, {top: 48 + top}]}>
        <Text style={styles.heading}>Configure Video and Audio</Text>
      </View>

      <View style={[styles.buttonRow, {bottom: 24 + bottom, left, right}]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconSubContainer}>
            <HMSManageLocalAudio />
            <HMSManageLocalVideo />
          </View>
          <View style={styles.iconSubContainer}>
            <HMSShowNetworkQuality />
          </View>
        </View>
        <CustomButton
          title="Enter Studio ->"
          onPress={() => {
            join();
          }}
          loading={loadingButtonState}
          viewStyle={styles.joinButton}
          textStyle={styles.joinButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    position: 'absolute',
    maxWidth: '100%',
    zIndex: 99,
  },
  textContainer: {
    position: 'absolute',
    width: '80%',
    zIndex: 99,
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderRadius: 8,
    width: '50%',
    alignSelf: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  heading: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.15,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
