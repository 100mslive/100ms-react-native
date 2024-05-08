import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HMSNotifications } from './HMSNotifications';

const _HLSNotifications = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomInset + 90,
        },
      ]}
    >
      <HMSNotifications />
    </View>
  );
};

export const HLSNotifications = React.memo(_HLSNotifications);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 1,
  },
});
