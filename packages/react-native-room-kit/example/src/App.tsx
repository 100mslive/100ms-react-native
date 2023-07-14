import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { multiply } from '@100mslive/react-native-room-kit';
import { HMSSDK } from '@100mslive/react-native-hms';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  React.useEffect(() => {
    const run = async () => {
      const hmsInstance = await HMSSDK.build();
    };

    run();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  text: {
    color: '#ffffff',
  },
});
