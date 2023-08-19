import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS } from '../utils/theme';

export type ControlType =
  | 'play'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'seekForward'
  | 'seekBackward'
  | 'seekToLive'
  | 'setVolume';

export interface CustomControlsProps {
  handleControlPress(action: ControlType, data?: any): void;
}

export const CustomControls: React.FC<CustomControlsProps> = ({
  handleControlPress,
}) => {
  return (
    <View>
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('play')}
        >
          <Text style={styles.text}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('stop')}
        >
          <Text style={styles.text}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('pause')}
        >
          <Text style={styles.text}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('resume')}
        >
          <Text style={styles.text}>Resume</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.spacedWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('seekForward', 5)}
        >
          <Text style={styles.text}>Forward 5 sec</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('seekBackward', 5)}
        >
          <Text style={styles.text}>Backward 5 sec</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.spacedWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('seekToLive')}
        >
          <Text style={styles.text}>Go to Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleControlPress('setVolume', 50)}
        >
          <Text style={styles.text}>Low Volume to `50`</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', justifyContent: 'space-evenly' },
  spacedWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 8,
  },
  button: { padding: 12 },
  text: { color: COLORS.PRIMARY.LIGHT },
});
