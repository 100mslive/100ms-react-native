import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';

import { PipModes } from '../utils/types';
import type { RootState } from '../redux';

export interface WelcomeInMeetingProps {}

export const WelcomeInMeeting: React.FC<WelcomeInMeetingProps> = () => {
  const isPipModeActive = useSelector(
    (state: RootState) => state.app.pipModeStatus === PipModes.ACTIVE
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/welcome.png')}
        style={{
          width: isPipModeActive ? 149/2 : 149,
          height: isPipModeActive ? 152/2 : 152,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
