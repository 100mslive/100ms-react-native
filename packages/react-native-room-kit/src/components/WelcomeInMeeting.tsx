import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { HMSNotifications } from './HMSNotifications';

export interface WelcomeInMeetingProps {}

export const WelcomeInMeeting: React.FC<WelcomeInMeetingProps> = () => {
  return (
    <>
      <View style={styles.container}>
        <Image
          source={require('../assets/welcome.png')}
          style={{ width: 149, height: 152 }} />
      </View>

      <HMSNotifications />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
